class Player {
    constructor({position, width, height, CollisionBlocks}) {
        this.position = {
            x: position.x,
            y: position.y
        }
        this.newPosition = {
            x: position.x,
            y: position.y
        }
        this.newPositionTime = 1
        this.jumpAvailable = false
        this.velocity = {
            x: 0,
            y: 0
        }
        this.acceleration = {
            x: 0,
            y: 0.25
        }
        this.width = width
        this.height = height
        this.sides = {
            bottom: this.position.y - this.height,
            top: this.position.y,
            left: this.position.x,
            right: this.position.x + this.width,
        }
        this.newSides = this.sides
        this.style = 'green'

        this.collisionTime = 1
        this.CollisionBlocks = CollisionBlocks
        this.nearestCollisionBlocksX = []
        this.nearestCollisionBlocksY = []
        this.nearestCollisionBlockTimeX = Number.MAX_VALUE
        this.nearestCollisionBlockTimeY = Number.MAX_VALUE
    }

    jump() {
        if (this.velocity.y == 0 && this.sides.bottom >= canvas.height/3 || this.jumpAvailable) {
            this.velocity.y = -4.25
            this.jumpAvailable = false
        }
    }

    walkRight() {
        this.velocity.x = 3
    }

    walkLeft() {
        this.velocity.x = -3
    }

    stopWalking() {
        this.velocity.x = 0
    }

    calculateNewPosition() {
        this.newPosition.x += this.velocity.x
        if (this.newPosition.x > canvas.width/3 - this.width) {
            this.newPosition.x = canvas.width/3 - this.width
        } else if (this.newPosition.x < 0) {
            this.newPosition.x = 0
        }

        if (this.sides.bottom + this.velocity.y < canvas.height/3) {
            this.velocity.y += this.acceleration.y
            this.newPosition.y += this.velocity.y
        } else {
            this.velocity.y = 0
            this.newPosition.y = canvas.height/3 - this.height
            this.jumpAvailable = true
        }
    }

    getSides(position) {
        return {
            bottom: position.y + this.height,
            top: position.y,
            left: position.x,
            right: position.x + this.width,
        }
    }

    checkCollisions() {
        this.collisionTime = 1
        this.newPositionTimeX = 1
        this.newPositionTimeY = 1
        this.CollisionBlocks.forEach((collisionItem) => {
            collisionItem.checkedX = false
            collisionItem.checkedY = false
        })
        while (this.collisionTime > 0) {
            this.sides = this.getSides(this.position)
            this.collectNearestCollisionBlocks()
            if (this.velocity.y < 0) {
                // console.log(this.collisionTime, this.nearestCollisionBlockTimeX, this.nearestCollisionBlocksX, this.nearestCollisionBlockTimeY, this.nearestCollisionBlocksY)
                // console.log(this.position, this.newPosition)
                // console.log(this.velocity)
            }
            if ((this.nearestCollisionBlockTimeX < this.nearestCollisionBlockTimeY || this.nearestCollisionBlockTimeX == this.nearestCollisionBlockTimeY && this.nearestCollisionBlocksX.length >= this.nearestCollisionBlocksY.length) && this.nearestCollisionBlocksX.length != 0 && this.velocity.x != 0) {
                this.nearestCollisionBlocksX.forEach((collisionItem) => {
                    this.checkXCollision({collisionBlock: collisionItem})
                    this.newSides = this.getSides(this.newPosition)
                })
            } 
            else if ((this.nearestCollisionBlocksY.length != 0) && this.velocity.y != 0) {
                // console.log('y', this.nearestCollisionBlocksY[0].sides)
                this.nearestCollisionBlocksY.forEach((collisionItem) => {
                    // console.log(collisionItem.position)
                    this.checkYCollision({collisionBlock: collisionItem})
                    this.newSides = this.getSides(this.newPosition)
                })
            } 
            else {
                break
            }
        }
    }

    yFunc(t, startY) {
        return startY + this.velocity.y * t + this.acceleration.y * t * (t+1) / 2
    }
    xFunc(t, startX) {
        return startX + this.velocity.x * t
    }
    calcIntersectionTimeByX(startX, collisionX) {
        return (collisionX - startX) / this.velocity.x
    }
    calcIntersectionTimeByY(startY, collisionY) {
        let D = (this.velocity.y + this.acceleration.y / 2) * (this.velocity.y + this.acceleration.y / 2) - 
            2 * this.acceleration.y * (collisionY - startY)
        if (D <= 0) {
            return {t1: 2,
                    t2: 2}
        }
        let sqrtD = Math.sqrt(D)
        return {t1: (this.velocity.y + this.acceleration.y / 2 - sqrtD) / this.acceleration.y,
                t2: (this.velocity.y + this.acceleration.y / 2 + sqrtD) / this.acceleration.y}

    }
    collectNearestCollisionBlocks() {
        this.nearestCollisionBlocksX = []
        this.nearestCollisionBlocksY = []
        this.nearestCollisionBlockTimeX = this.collisionTime
        this.nearestCollisionBlockTimeY = this.collisionTime
        this.newSides = this.getSides(this.newPosition)
        this.CollisionBlocks.forEach((collisionItem) => {
            this.checkNearestCollisionBlock({collisionBlock: collisionItem})
        })
        this.nearestCollisionBlocksX.forEach((collisionBlock) => {
            collisionBlock.draw({style: 'rgba(255, 0, 0, 0.5)'})})
        this.nearestCollisionBlocksY.forEach((collisionBlock) => {
            // console.log(collisionBlock.sides)
            collisionBlock.draw({style: 'rgba(0, 0, 255, 0.5)'})})
        if ((this.nearestCollisionBlockTimeX != 0 && this.nearestCollisionBlocksX.length != 0) || (this.nearestCollisionBlockTimeY != 0 && this.nearestCollisionBlocksY.length != 0)) {
            // console.log(this.velocity, this.nearestCollisionBlockTimeX, this.nearestCollisionBlockTimeY)
        }
    }
    checkNearestCollisionBlock({collisionBlock}) {
        if (collisionBlock.checkIntersction({sides: this.sides, newSides: this.newSides})) {
            if (!collisionBlock.checkedX) {
                let collisionTimeX = this.collisionTime
                if (this.velocity.x > 0) {
                    let lct = this.calcIntersectionTimeByX(
                        this.sides.right, collisionBlock.sides.left)
                    // console.log('x', collisionBlock, lct)
                    if ((lct >= 0) && (lct <= this.newPositionTime) && (lct < collisionTimeX)) {
                        collisionTimeX = lct
                    }
                } 
                else if (this.velocity.x < 0) {
                    let lct = this.calcIntersectionTimeByX(
                        this.sides.left, collisionBlock.sides.right)
                    if ((lct >= 0) && (lct <= this.newPositionTime) && (lct < collisionTimeX)) {
                        collisionTimeX = lct
                    }
                }
                if (collisionTimeX < this.nearestCollisionBlockTimeX) {
                    this.nearestCollisionBlocksX = [collisionBlock]
                    this.nearestCollisionBlockTimeX = collisionTimeX
                } else if ((collisionTimeX == this.nearestCollisionBlockTimeX) && (collisionTimeX != this.collisionTime)) {
                    this.nearestCollisionBlocksX.push(collisionBlock)
                }
            }
            if (!collisionBlock.checkedY) {
                let collisionTimeY = this.collisionTime
                if (this.velocity.y < 0) {
                    let lct = this.calcIntersectionTimeByY(
                        this.sides.top, collisionBlock.sides.bottom)
                    // console.log('y', collisionBlock, lct)
                    if ((lct.t1 >= 0) && (lct.t1 <= this.newPositionTime) && (lct.t1 < collisionTimeY)) {
                        collisionTimeY = lct.t1
                    } 
                    else if ((lct.t2 >= 0) && (lct.t2 <= this.newPositionTime) && (lct.t2 < collisionTimeY)) {
                        collisionTimeY = lct.t2
                    }
                }
                else if (this.velocity.y >= 0) {
                    let lct = this.calcIntersectionTimeByY(
                        this.sides.bottom, collisionBlock.sides.top)
                    if ((lct.t1 >= 0) && (lct.t1 <= this.newPositionTime) && (lct.t1 < collisionTimeY)) {
                        collisionTimeY = lct.t1
                    } 
                    else if ((lct.t2 >= 0) && (lct.t2 <= this.newPositionTime) && (lct.t2 < collisionTimeY)) {
                        collisionTimeY = lct.t2
                    }
                }
                if (collisionTimeY < this.nearestCollisionBlockTimeY) {
                    this.nearestCollisionBlocksY = [collisionBlock]
                    this.nearestCollisionBlockTimeY = collisionTimeY
                } else if ((collisionTimeY == this.nearestCollisionBlockTimeY) && (collisionTimeY != this.collisionTime)) {
                    this.nearestCollisionBlocksY.push(collisionBlock)
                }
            }
        }
    }
    checkXCollision({collisionBlock}) {
        let collisionTime = this.nearestCollisionBlockTimeX
        if (this.velocity.x > 0) {
            if ((this.yFunc(collisionTime, this.sides.bottom) > collisionBlock.sides.top) && 
            (this.yFunc(collisionTime, this.sides.top) < collisionBlock.sides.bottom)) {
                this.position.x = collisionBlock.sides.left - this.width
                this.newPosition.x = this.position.x
                this.velocity.x = 0
                // this.collisionTime = this.collisionTime - collisionTime
            } else {
                collisionBlock.checkedX = true
                // this.position.x = this.newPosition.x
            }
            // this.newPosition.x = this.position.x
        }
        else if (this.velocity.x < 0) {
            if ((this.yFunc(collisionTime, this.sides.bottom) > collisionBlock.sides.top) && 
            (this.yFunc(collisionTime, this.sides.top) < collisionBlock.sides.bottom)) {
                this.position.x = collisionBlock.sides.right
                this.newPosition.x = this.position.x
                this.velocity.x = 0
                // this.collisionTime = this.collisionTime - collisionTime
            } else {
                collisionBlock.checkedX = true
                // this.position.x = this.newPosition.x
            }
            // this.newPosition.x = this.position.x
        }
    }
    checkYCollision({collisionBlock}) {
        let collisionTime = this.nearestCollisionBlockTimeY
        if (this.velocity.y < 0) {
            if ((this.xFunc(collisionTime, this.sides.left) < collisionBlock.sides.right) && 
            (this.xFunc(collisionTime, this.sides.right) > collisionBlock.sides.left)) {
                if (collisionBlock.position.x == 224 && collisionBlock.position.y == 64) {
                    console.log(this.position, this.newPosition)
                }
                this.position.y = collisionBlock.sides.bottom
                this.newPosition.y = this.position.y
                this.velocity.y = 0
                // this.collisionTime = this.collisionTime - collisionTime
            } else {
                collisionBlock.checkedY = true
                // this.position.y = this.newPosition.y
            }
            // this.newPosition.y = this.position.y
        }
        else if (this.velocity.y > 0) {
            if ((this.xFunc(collisionTime, this.sides.left) < collisionBlock.sides.right) && 
            (this.xFunc(collisionTime, this.sides.right) > collisionBlock.sides.left)) {
                this.position.y = collisionBlock.sides.top - this.height
                this.newPosition.y = this.position.y
                this.velocity.y = 0
                // this.collisionTime = this.collisionTime - collisionTime
                this.jumpAvailable = true
            } else {
                collisionBlock.checkedY = true
                // this.position.y = this.newPosition.y
            }
            // this.newPosition.y = this.position.y
        }
    }

    update() {
        this.calculateNewPosition()
        this.checkCollisions()
        this.sides = this.getSides(this.newPosition)
        this.position = {
            x: this.newPosition.x,
            y: this.newPosition.y
        }
        this.newPositionTimeX = 1
        this.newPositionTimeY = 1   
    }

    draw() {
        c.fillStyle = this.style;
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}
