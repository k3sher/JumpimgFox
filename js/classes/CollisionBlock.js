class CollisionBlock {
    constructor({position, tileSize}) {
        this.position = position
        this.width = tileSize
        this.height = tileSize
        this.sides = {
            left: this.position.x,
            right: this.position.x + this.width,
            top: this.position.y,
            bottom: this.position.y + this. height,
        }
        this.checkedX = false
        this.checkedY = false

    }
    draw({style}) {
        c.fillStyle = style
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
    checkRelativePosition({position}) {
        let relativePosition = 0
        if (position.x >= this.sides.left) {relativePosition += 1}
        if (position.x > this.sides.left) {relativePosition += 1}
        if (position.x >= this.sides.right) {relativePosition += 1}
        if (position.x > this.sides.right) {relativePosition += 1}
        if (position.y >= this.sides.top) {relativePosition += 5}
        if (position.y > this.sides.top) {relativePosition += 5}
        if (position.y >= this.sides.bottom) {relativePosition += 5}
        if (position.y > this.sides.bottom) {relativePosition += 5}
        return relativePosition
    }
    checkIntersction({sides, newSides}) {
        return ((Math.min(sides.top, newSides.top) < this.sides.bottom) && 
            (Math.max(sides.bottom, newSides.bottom) > this.sides.top)  && 
            (Math.min(sides.left, newSides.left) < this.sides.right)   && 
            (Math.max(sides.right, newSides.right) > this.sides.left))
    }
    checkIntersctionWithBounds({sides, newSides}) {
        return ((Math.min(sides.top, newSides.top) <= this.sides.bottom) && 
            (Math.max(sides.bottom, newSides.bottom) >= this.sides.top)  && 
            (Math.min(sides.left, newSides.left) <= this.sides.right)   && 
            (Math.max(sides.right, newSides.right) >= this.sides.left))
    }
}