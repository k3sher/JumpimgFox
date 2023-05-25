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
            y: DEFAULT_ACCELARATION
        }
        this.width = width
        this.height = height
        this.sides = {
            bottom: this.position.y + this.height,
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
        this.state = {
            top: false,
            bottom: false,
            left: false,
            leftPush: false,
            right: false,
            rightPush: false,
            onWall: false
        }

        this.cameraBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            }, 
            sides:{
                bottom: this.position.y + 80,
                top: this.position.y,
                left: this.position.x,
                right: this.position.x + 200,
            },
            width: 200,
            height: 80
        }
        this.collectedCoins = 0
    }

    jump() {
        if (this.state.bottom) {
            this.velocity.y = JUMP_VELOCITY
            this.jumpAvailable = false
        }
    }

    walkRight() {
        // if (this.state.onWall && !this.state.bottom && !this.state.top && (this.state.left || this.state.leftPush)) {
        if (!this.state.bottom && !this.state.top && (this.state.left || this.state.leftPush)) {
            this.velocity.y = FROM_WALL_JUMP_VERTICAL_VELOCITY
        }
        this.velocity.x = RIGHT_VELOCITY
    }

    walkLeft() {
        // if (this.state.onWall && !this.state.bottom && !this.state.top && (this.state.right || this.state.rightPush)) {
        if (!this.state.bottom && !this.state.top && (this.state.right || this.state.rightPush)) {
            this.velocity.y = FROM_WALL_JUMP_VERTICAL_VELOCITY
        }
        this.velocity.x = LEFT_VELOCITY
    }

    stopWalking() {
        this.velocity.x = 0
    }

    calculateNewPosition() {
        this.newPosition.x += this.velocity.x
        this.velocity.y += this.acceleration.y
        if (this.state.onWall && (this.velocity.y > ON_WALL_MAX_FALL_SPEED)) {
            this.velocity.y = ON_WALL_MAX_FALL_SPEED
        } else if (!this.state.onWall && (this.velocity.y > DEFAULT_MAX_FALL_SPEED)) {
            this.velocity.y = DEFAULT_MAX_FALL_SPEED
        }
        this.newPosition.y += this.velocity.y
        // if (this.newPosition.x > canvas.width/CANVAS_SCALE - this.width) {
        //     this.newPosition.x = canvas.width/CANVAS_SCALE - this.width
        // } else if (this.newPosition.x < 0) {
        //     this.newPosition.x = 0
        // }

        // if (this.sides.bottom + this.velocity.y < canvas.height/CANVAS_SCALE) {
        // } else {
        //     this.velocity.y = 0
        //     this.newPosition.y = canvas.height/CANVAS_SCALE - this.height
        //     this.jumpAvailable = true
        // }
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
            if (this.nearestCollisionBlockTimeX == this.nearestCollisionBlockTimeY && this.nearestCollisionBlocksX.length == 1 && this.nearestCollisionBlocksY.length == 1) {
                this.checkAngleCollision({collisionBlock: this.nearestCollisionBlocksX[0]})
            } else if ((this.nearestCollisionBlockTimeX < this.nearestCollisionBlockTimeY) && this.nearestCollisionBlocksX.length != 0 && this.velocity.x != 0) {
                this.nearestCollisionBlocksX.forEach((collisionItem) => {
                    this.checkXCollision({collisionBlock: collisionItem})
                    this.newSides = this.getSides(this.newPosition)
                })
            } 
            else if ((this.nearestCollisionBlocksY.length != 0) && this.velocity.y != 0) {
                this.nearestCollisionBlocksY.forEach((collisionItem) => {
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
        if (this.acceleration.y == 0) {
            return {t1: (collisionY - startY) / this.velocity.y,
                    t2: (collisionY - startY) / this.velocity.y}
        }
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
        if (IS_DEBUG) {
            this.nearestCollisionBlocksX.forEach((collisionBlock) => {
                collisionBlock.draw({style: 'rgba(255, 0, 0, 0.5)'})})
            this.nearestCollisionBlocksY.forEach((collisionBlock) => {
                collisionBlock.draw({style: 'rgba(0, 0, 255, 0.5)'})})
        }
    }
    checkNearestCollisionBlock({collisionBlock}) {
        if (collisionBlock.checkIntersction({sides: this.sides, newSides: this.newSides})) {
            if (!collisionBlock.checkedX) {
                let collisionTimeX = this.collisionTime
                if (this.velocity.x > 0) {
                    let lct = this.calcIntersectionTimeByX(
                        this.sides.right, collisionBlock.sides.left)
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
    checkAngleCollision({collisionBlock}) {
        if (this.velocity.y < 0) {
            
            if (this.velocity.x > 0) {
                this.position.x = collisionBlock.sides.left - this.width
                this.newPosition.x = this.position.x
            } else {
                this.position.x = collisionBlock.sides.right
                this.newPosition.x = this.position.x
            }
            this.velocity.x = 0
        } else {
            this.position.y = collisionBlock.sides.top - this.height
            this.newPosition.y = this.position.y
            this.velocity.y = 0
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
                this.state.rightPush = true
            } else {
                collisionBlock.checkedX = true
            }
        }
        else if (this.velocity.x < 0) {
            if ((this.yFunc(collisionTime, this.sides.bottom) > collisionBlock.sides.top) && 
            (this.yFunc(collisionTime, this.sides.top) < collisionBlock.sides.bottom)) {
                this.position.x = collisionBlock.sides.right
                this.newPosition.x = this.position.x
                this.velocity.x = 0
                this.state.leftPush = true
            } else {
                collisionBlock.checkedX = true
            }
        }
    }
    checkYCollision({collisionBlock}) {
        let collisionTime = this.nearestCollisionBlockTimeY
        if (this.velocity.y < 0) {
            if ((this.xFunc(collisionTime, this.sides.left) < collisionBlock.sides.right) && 
            (this.xFunc(collisionTime, this.sides.right) > collisionBlock.sides.left)) {
                this.position.y = collisionBlock.sides.bottom
                this.newPosition.y = this.position.y
                this.velocity.y = 0
            } else {
                collisionBlock.checkedY = true
            }
        }
        else if (this.velocity.y > 0) {
            if ((this.xFunc(collisionTime, this.sides.left) < collisionBlock.sides.right) && 
            (this.xFunc(collisionTime, this.sides.right) > collisionBlock.sides.left)) {
                this.position.y = collisionBlock.sides.top - this.height
                this.newPosition.y = this.position.y
                this.velocity.y = 0
                this.jumpAvailable = true
            } else {
                collisionBlock.checkedY = true
            }
        }
    }

    resetState() {
        this.state = {
            top: false,
            bottom: false,
            left: false,
            leftPush: false,
            right: false,
            rightPush: false,
            onWall: this.state.onWall
        }
    }

    updateState() {
        this.CollisionBlocks.forEach((collisionItem) => {
            if (collisionItem.checkIntersctionWithBounds({sides: this.sides, newSides: this.sides})) {
                if (this.sides.left < collisionItem.sides.right && this.sides.right > collisionItem.sides.left) {
                    if (this.sides.top == collisionItem.sides.bottom) {
                        this.state.top = true
                    }
                    if (this.sides.bottom == collisionItem.sides.top) {
                        this.state.bottom = true
                    }
                }
                if (this.sides.top < collisionItem.sides.bottom && this.sides.bottom > collisionItem.sides.top) {
                    if (this.sides.left == collisionItem.sides.right) {
                        this.state.left = true
                    }
                    if (this.sides.right == collisionItem.sides.left) {
                        this.state.right = true
                    }
                }
            }
        })

    }

    updateAcceleration() {
        if ((this.state.leftPush || this.state.rightPush) && this.velocity.y >= 0) {
            this.acceleration.y = ON_WALL_ACCELARATION
            this.state.onWall = true
        } else
        if ((this.state.left || this.state.right) && this.state.onWall && this.velocity.y >= 0) {
            this.acceleration.y = ON_WALL_ACCELARATION
        } else {
            this.acceleration.y = DEFAULT_ACCELARATION
            this.state.onWall = false
        }
    }

    updatecameraBox() {
        this.cameraBox = {
            position: {
                x: this.position.x - (this.cameraBox.width - this.width)/2,
                y: this.position.y - (this.cameraBox.height - this.height)/2,
            }, 
            sides: this.cameraBox.sides,
            width: this.cameraBox.width,
            height: this.cameraBox.height
        }
        this.cameraBox.sides = {
            bottom: this.cameraBox.position.y + this.cameraBox.height,
            top: this.cameraBox.position.y,
            left: this.cameraBox.position.x,
            right: this.cameraBox.position.x + this.cameraBox.width,
        }
        if (IS_DEBUG){
            this.drawCameraBox()
        }
    }

    drawCameraBox() {
        c.fillStyle = 'rgba(0, 0, 255, 0.1)'
        c.fillRect(
            this.cameraBox.position.x,
            this.cameraBox.position.y,
            this.cameraBox.width,
            this.cameraBox.height
        )
    }

    updateCameraByPlayerCameraBox({canvas, camera, levelSizes}) {
        if (this.cameraBox.sides.right > camera.position.x + canvas.width/CANVAS_SCALE) {
            camera.position.x = this.cameraBox.sides.right - canvas.width/CANVAS_SCALE
        }
        if (this.cameraBox.sides.left < camera.position.x) {
            camera.position.x = this.cameraBox.sides.left
        }
        if (this.cameraBox.sides.top < camera.position.y) {
            camera.position.y = this.cameraBox.sides.top
        }
        if (this.cameraBox.sides.bottom > canvas.height/CANVAS_SCALE + camera.position.y) {
            camera.position.y = this.cameraBox.sides.bottom - canvas.height/CANVAS_SCALE
        }

        if (camera.position.x < 0) {
            camera.position.x = 0
        }
        if (camera.position.x + canvas.width/CANVAS_SCALE > levelSizes.width) {
            camera.position.x = levelSizes.width - canvas.width/CANVAS_SCALE
        }
        if (camera.position.y < 0) {
            camera.position.y = 0
        }
        if (camera.position.y + canvas.height/CANVAS_SCALE > levelSizes.height) {
            camera.position.y = levelSizes.height - canvas.height/CANVAS_SCALE
        }
    }


    update() {
        this.updateAcceleration()
        this.calculateNewPosition()
        this.resetState()
        this.checkCollisions()
        this.sides = this.getSides(this.newPosition)
        this.position = {
            x: this.newPosition.x,
            y: this.newPosition.y
        }
        this.updateState()
        this.updatecameraBox()
        
        // console.log(this.state.onWall)
        this.newPositionTimeX = 1
        this.newPositionTimeY = 1
    }

    draw() {
        c.fillStyle = this.style;
        c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
}
