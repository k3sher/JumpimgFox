class PlayerStats {
    constructor({ position, player }) {
        this.position = {
            x: position.x,
            y: position.y
        }
        this.player = player
        this.relativeCoinImagePosition = {
            x: -8,
            y: -8
        }
        this.relativeCoinTextPosition = {
            x: 20,
            y: 14
        }
        this.coinSprite = new Sprite({
            position: {
                x: this.position.x + this.relativeCoinImagePosition.x,
                y: this.position.y + this.relativeCoinImagePosition.y
            },
            imageSrc: COIN_IMAGE_SRC
        })
        this.backgroundSprite = new Sprite({
            position: {
                x: this.position.x,
                y: this.position.y
            },
            imageSrc: STATS_BACKGROUND_SRC
        })
    }

    updatePosition({ position }) {
        this.position = {
            x: position.x,
            y: position.y
        }
        this.coinSprite.updatePosition({
            position: {
                x: this.position.x + this.relativeCoinImagePosition.x,
                y: this.position.y + this.relativeCoinImagePosition.y
            }
        })
        this.backgroundSprite.updatePosition({
            position: {
                x: this.position.x,
                y: this.position.y
            }
        })
    }

    drawCoinsStats() {
        c.font = STATS_TEXT_FONT
        c.fillStyle = STATS_TEXT_COLOR
        c.fillText(
            this.player.collectedCoins,
            this.position.x + this.relativeCoinTextPosition.x,
            this.position.y + this.relativeCoinTextPosition.y
        );
    }

    draw() {
        this.backgroundSprite.draw()
        this.coinSprite.draw()
        this.drawCoinsStats()
    }
}
