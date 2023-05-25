const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')

canvas.width = 48 * 15
canvas.height = 48 * 15


const CollisionBlocks = []
testLevelInfo.collisions.forEach((symbol, pos) => {
    if (symbol != 0) {
        CollisionBlocks.push(
            new CollisionBlock({
                position: {
                    x: pos % testLevelInfo.width * 16,
                    y: (pos - pos % testLevelInfo.width) / testLevelInfo.width * 16}
                }
            )
        )
    }
})


const backgroundTestLevel = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: './src/maps/test_FoxJapMap.png',
})


const x = canvas.width / 2
const y = canvas.height / 2

const player = new Player({
    position: {
        x: 203,
        y: 88,
    },
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
    c.scale(3,3)
    backgroundTestLevel.draw()
    // CollisionBlocks.forEach((block) => {block.draw()})
    player.update()
    player.draw()
    key_processing()
    c.restore()
}

animate()