playerAnimationInfo = {
    frameHeight: 64,
    frameWidth: 64,
    scale: 0.5,
    hitboxMargin: {
        fromTop: 18,
        fromBottom: 18,
        fromLeft: 21,
        fromRight: 21,
    },
    statesAssets: {
        standing: {
            left: {
                assetImgSrc: './src/objects/player/standing-left-asset.png',
                frameRate: 6,
                frameDelay: 2,
            },
            right: {
                assetImgSrc: './src/objects/player/standing-right-asset.png',
                frameRate: 6,
                frameDelay: 2,
            },
        },
        moving: {
            left: {
                assetImgSrc: './src/objects/player/moving-left-asset.png',
                frameRate: 4,
                frameDelay: 2,
            },
            right: {
                assetImgSrc: './src/objects/player/moving-right-asset.png',
                frameRate: 4,
                frameDelay: 2,
            },
        },
        jumping: {
            left: {
                assetImgSrc: './src/objects/player/jumping-left-asset.png',
                frameRate: 6,
                frameDelay: 2,
            },
            right: {
                assetImgSrc: './src/objects/player/jumping-right-asset.png',
                frameRate: 6,
                frameDelay: 2,
            },
        },
        falling: {
            left: {
                assetImgSrc: './src/objects/player/falling-left-asset.png',
                frameRate: 4,
                frameDelay: 3,
            },
            right: {
                assetImgSrc: './src/objects/player/falling-right-asset.png',
                frameRate: 4,
                frameDelay: 3,
            },
        },
        wallSliding: {
            left: {
                assetImgSrc: './src/objects/player/wallSliding-left-asset.png',
                frameRate: 4,
                frameDelay: 3,
            },
            right: {
                assetImgSrc: './src/objects/player/wallSliding-right-asset.png',
                frameRate: 4,
                frameDelay: 3,
            },
        },
    }
}
