const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const camera = {
    position: {
        x: 0,
        y: 0
    }
}

canvas.width = 960
canvas.height = 480

let levelInfo = testCastleLevelInfo


const CollisionBlocks = []
levelInfo.collisions.forEach((symbol, pos) => {
    if (symbol == levelInfo.collisionId) {
        CollisionBlocks.push(
            new CollisionBlock({
                position: {
                    x: pos % levelInfo.width * levelInfo.tileSize,
                    y: (pos - pos % levelInfo.width) / levelInfo.width * levelInfo.tileSize
                },
                tileSize: levelInfo.tileSize
                }
            )
        )
    }
})

const secretRooms = []
for (let i = 0; i < levelInfo.secretRoomsIds.length; i++) {
    let areaBlocks = []
    levelInfo.areas.forEach((symbol, pos) => {
        if (symbol == levelInfo.secretRoomsIds[i]) {
            areaBlocks.push(
                new AreaBlock({
                    position: {
                        x: pos % levelInfo.width * levelInfo.tileSize,
                        y: (pos - pos % levelInfo.width) / levelInfo.width * levelInfo.tileSize
                    },
                    tileSize: levelInfo.tileSize
                    }
                )
            )
        }
    })
    secretRooms.push(
        new Area({
            areaSprite: new Sprite({
                position: {
                    x: 0,
                    y: 0,
                },
                imageSrc: levelInfo.secretRoomsSrc[i],
            }), 
            areaBlocks: areaBlocks
        })
    )
}

const levelSizes = {
    width: levelInfo.width * levelInfo.tileSize,
    height: levelInfo.height * levelInfo.tileSize,
}


const backgroundTestLevel = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: levelInfo.imageSrc,
})


const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player({
    position: levelInfo.startPosition,
    width: 16,
    height: 16,
    CollisionBlocks: CollisionBlocks
})

const keys = {
    w: {
        pressed: false,
    },
    a: {
        pressed: false,
    },
    d: {
        pressed: false,
    },
}

function key_processing() {
    if (keys.w.pressed) player.jump()
    if (keys.a.pressed && !keys.d.pressed) player.walkLeft()
    else if (!keys.a.pressed && keys.d.pressed) player.walkRight()
    else player.stopWalking()
}

function animate() {
    window.requestAnimationFrame(animate)
    c.clearRect(0,0,canvas.width,canvas.height)
    c.fillStyle = 'white'
    c.fillRect(0,0,canvas.width,canvas.height)
    c.save()
    c.scale(CANVAS_SCALE, CANVAS_SCALE)
    c.translate(-camera.position.x, -camera.position.y)
    backgroundTestLevel.draw()
    // CollisionBlocks.forEach((block) => {block.draw()})
    player.update()
    player.updateCameraByPlayerCameraBox({canvas: canvas, camera: camera, levelSizes: levelSizes})
    secretRooms.forEach(area => {area.draw({playerSides: player.sides})})
    player.draw()
    key_processing()
    c.restore()
}

animate()