import * as dotenv from 'dotenv';
//@ts-ignore
import pem from 'https-pem';

dotenv.config({path: 'env/' + (process.env.ENV ? process.env.ENV : 'dev') + '.env'});

let publicRuntimeConfig: { [key: string]: string | undefined } = {};
for (let key of Object.keys(process.env).filter(value => value.includes('NUXT_PUBLIC_'))) {
    publicRuntimeConfig[key] = process.env[key];
}
export default {
    server: {
        https: process.env.ENV === 'local' ? pem : undefined,
    },
    publicRuntimeConfig: publicRuntimeConfig,
    privateRuntimeConfig: {},
    serverMiddleware: ['~/server-middleware/index.ts'],
    buildModules: [
        '@nuxt/typescript-build',
    ],
    io: {
        sockets: [
            {
                name: 'mediasoup',
                url: process.env.NUXT_PUBLIC_WEBRTC_URL,
                default: true,
            },
        ],
    },
    modules: [
        {src: 'nuxt-socket-io'},
        '@nuxtjs/axios',
    ],
    plugins: [
        {src: '~/plugins/mediasoup', mode: 'client'},
    ],
    transpileDependencies: [
        'vuex-module-decorators',
    ],
};
