class AreaBlock {
    // Инициализация блока скрытой области
    constructor({ position, tileSize }) {
        this.position = position
        this.width = tileSize
        this.height = tileSize
        this.sides = {
            left: this.position.x,
            right: this.position.x + this.width,
            top: this.position.y,
            bottom: this.position.y + this.height,
        }
    }

    // Проверка наличия строгого пересечения (ненулевой площади)
    checkIntersction({ sides }) {
        return ((sides.top < this.sides.bottom) &&
            (sides.bottom > this.sides.top) &&
            (sides.left < this.sides.right) &&
            (sides.right > this.sides.left))
    }

    // Подсчет площади пересечения
    calcIntersection({ sides }) {
        if (this.checkIntersction({ sides: sides })) {
            const intersectionWidth = Math.min(sides.right, this.sides.right) - Math.max(sides.left, this.sides.left)
            const intersectionHeight = Math.min(sides.bottom, this.sides.bottom) - Math.max(sides.top, this.sides.top)
            return intersectionWidth * intersectionHeight
        } else {
            return 0
        }
    }
}
