class Sprite {
    // Инициализация объекта изображения или анимирования
    constructor({ position, imageSrc, frameRate = 1, frameDelay = 3, scale = 1 }) {
        this.position = position
        this.frameDelay = frameDelay
        this.frameRate = frameRate
        this.scale = scale
        this.loaded = false
        this.image = new Image()
        this.image.onload = () => {
            this.width = (this.image.width / this.frameRate) * this.scale
            this.height = this.image.height * this.scale
            this.loaded = true
        }
        this.image.src = imageSrc
        this.currentTic = 0
        this.currentFrame = 0
    }

    // Обновление текущей позиции изображения
    updatePosition({ position }) {
        this.position = position
    }

    // Получение текущей отображаемой области
    getFrameBox() {
        return {
            position: {
                x: this.currentFrame * (this.image.width / this.frameRate),
                y: 0,
            },
            width: this.image.width / this.frameRate,
            height: this.image.height,
        }
    }

    // Отображение необходимой картинки анимации  
    draw() {
        if (!this.image) return

        const frameBox = this.getFrameBox()

        c.drawImage(
            this.image,
            frameBox.position.x,
            frameBox.position.y,
            frameBox.width,
            frameBox.height,
            this.position.x,
            this.position.y,
            this.width,
            this.height
        )
    }

    // Отображение картинки с прозрачностью
    drawWithTransparentAlpha({ alpha }) {
        if (!this.image) return
        if (alpha >= 1) {
            this.draw()
        }
        c.globalAlpha = alpha;
        this.draw()
        c.globalAlpha = 1;
    }

    // Обновление текущего кадра анимации
    update() {
        this.currentTic++
        if (this.currentTic > this.frameDelay) {
            this.currentTic = 0
            if (this.currentFrame + 1 < this.frameRate) {
                this.currentFrame++
            } else {
                this.currentFrame = 0
            }
        }
    }

    // Сброс текущего кадра анимации к начальному
    resetAnimation() {
        this.currentTic = 0
        this.currentFrame = 0
    }
}
