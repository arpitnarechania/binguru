export default {
    input: 'lib/index.js',
    output: [
        {
            file: 'dist/index.mjs',
            format: 'es',
        },
        {
            file: 'dist/index.umd.js',
            format: 'umd',
            name: 'binguru'
        },
        {
            file: 'dist/index.amd.js',
            format: 'amd'
        },
        {
            file: 'dist/index.cjs',
            format: 'cjs'
        }
    ]
};