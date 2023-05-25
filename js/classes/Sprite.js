class Sprite {
    constructor({position, imageSrc}) {
        this.position = position
        this.image = new Image()
        this.image.src = imageSrc
    }
    updatePosition({position}) {
        this.position = position
    }
    draw() {
        c.drawImage(this.image, this.position.x, this.position.y)
    }
    drawWithTransparentAlpha({alpha}) {
        if (alpha >= 1) {
            this.draw()
        }
        c.globalAlpha = alpha;
        c.drawImage(this.image, this.position.x, this.position.y)
        c.globalAlpha = 1;
    }
}