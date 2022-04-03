const workbox = require("workbox-build")

workbox.generateSW({
    cacheId:"file_encrypt_online",
    globDirectory: "./",
    globPatterns: [
        "**/*.{css,js,html}"
    ],
    globIgnores:['**/generator.html','**/sw.js','node_modules/**/*']
    ,
    swDest:"./sw.js",
    runtimeCaching:[
        {
            urlPattern: /\.(?:png|jpg|svg)$/,
            handler: 'CacheFirst',
        },

    ],
})