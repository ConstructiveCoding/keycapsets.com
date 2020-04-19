import { useEffect } from 'react';
import { useRouter, NextRouter } from 'next/router';
import { useApolloClient } from '@apollo/react-hooks';
import { ApolloClient } from 'apollo-boost';

import { REDDIT_LOGIN } from '../queries';
import withData from '../hooks/withData';

import Button from './Button';
import { loginUser } from '../utils/userLogin';

const CLIENT_ID = 'OGPS_JHNLNt2sA';

function RedditAuth(): JSX.Element {
    const router: NextRouter = useRouter();
    const client: ApolloClient<any> = useApolloClient();

    useEffect(() => {
        const hash = window.location.hash;
        if (hash !== '') {
            const fragments: any = router.asPath
                .split('#')[1]
                .split('&')
                .reduce((res, fragment) => {
                    const [key, value] = fragment.split('=');
                    return {
                        ...res,
                        [key]: value,
                    };
                }, {});
            getAccesToken(fragments.access_token, fragments.state);
        }
    }, []);

    async function getAccesToken(token: any, state: any) {
        const readableStream: Response = await fetch('https://oauth.reddit.com/api/v1/me', {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        });
        const { id, name, oauth_client_id, link_karma, comment_karma } = await readableStream.json();
        const {
            data: { redditLogin },
        } = await client.mutate({
            mutation: REDDIT_LOGIN,
            variables: {
                redditId: `${id}_${oauth_client_id}`,
                redditUserName: name,
            },
        });
        loginUser(redditLogin);
    }

    async function handleRedditAuth() {
        const identifyUrl = `https://www.reddit.com/api/v1/authorize?client_id=${CLIENT_ID}&response_type=token&state=kcs&redirect_uri=http://localhost:3000/login&duration&scope=identity`;
        window.open(identifyUrl, '_self');
    }

    return (
        <Button variant="primary" size="md" onClick={handleRedditAuth}>
            Sign up with Reddit
        </Button>
    );
}

export default withData(RedditAuth);
