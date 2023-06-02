class CollisionBlock {
    // Инициализация объекта блока коллизии
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
        // Наличие проверки столкновений по определенной оси
        this.checkedX = false
        this.checkedY = false

    }

    // Отображение блока коллизии (режим отладки)
    draw({ style }) {
        c.fillStyle = style
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }

    // Проверка возможных пересечений персонажем во время перемещения
    // Проверка наличия строгого пересечения (ненулевой площади) 
    checkIntersction({ sides, newSides }) {
        return ((Math.min(sides.top, newSides.top) < this.sides.bottom) &&
            (Math.max(sides.bottom, newSides.bottom) > this.sides.top) &&
            (Math.min(sides.left, newSides.left) < this.sides.right) &&
            (Math.max(sides.right, newSides.right) > this.sides.left))
    }

    // Проверка наличия нестрогого пересечения
    checkIntersctionWithBounds({ sides, newSides }) {
        return ((Math.min(sides.top, newSides.top) <= this.sides.bottom) &&
            (Math.max(sides.bottom, newSides.bottom) >= this.sides.top) &&
            (Math.min(sides.left, newSides.left) <= this.sides.right) &&
            (Math.max(sides.right, newSides.right) >= this.sides.left))
    }
}
