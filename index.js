// Инициализация работы с canvas
const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
// Объявление переменной камеры (сдвига отображаемой области) 
const camera = {
    position: {
        x: 0,
        y: 0
    }
}
// Задание размеров холста
canvas.width = 960
canvas.height = 480
// Загрузка информации об уровне
let levelInfo = testCastleLevelInfo
// Инициализация всех блоков коллизии уровня
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
            })
        )
    }
})
// Инициализация всех скрытых локаций уровня
const secretRooms = []
for (let i = 0; i < levelInfo.secretRoomsIds.length; i++) {
    // Инициализация блоков области по скрытой локации
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
                })
            )
        }
    })
    // Создание и добавление к имющимся скрытой локации
    secretRooms.push(
        new Area({
            areaWallSprite: new Sprite({
                position: {
                    x: 0,
                    y: 0,
                },
                imageSrc: levelInfo.secretRoomsSrc[i].wall,
            }),
            areaBackgroundSprite: new Sprite({
                position: {
                    x: 0,
                    y: 0,
                },
                imageSrc: levelInfo.secretRoomsSrc[i].background,
            }),
            areaBlocks: areaBlocks
        })
    )
}
// Инициализация всех монет уровня
const coins = []
levelInfo.coinsPositions.forEach(mapPosition => {
    coins.push(new Coin({
        centerPosition: {
            x: mapPosition.x * levelInfo.tileSize,
            y: mapPosition.y * levelInfo.tileSize
        }
    }))
})
// Получение размеров уровня
const levelSizes = {
    width: levelInfo.width * levelInfo.tileSize,
    height: levelInfo.height * levelInfo.tileSize,
}
// Инициализация объекта изображения уровня
const backgroundTestLevel = new Sprite({
    position: {
        x: 0,
        y: 0,
    },
    imageSrc: levelInfo.imageSrc,
})
// Инициализация персонажа
const player = new Player({
    position: levelInfo.startPosition,
    animationInfo: playerAnimationInfo,
    CollisionBlocks: CollisionBlocks
})
// Инициализация блока статистики
const playerStats = new PlayerStats({
    position: camera.position,
    player: player
})
// Инициализация переменной для хранения состояния нажатия клавиш
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
// Функция отправляющая команды игровому персонажу по нажатым клавишам
function key_processing() {
    if (keys.w.pressed) player.jump()
    if (keys.a.pressed && !keys.d.pressed) player.walkLeft()
    else if (!keys.a.pressed && keys.d.pressed) player.walkRight()
    else player.stopWalking()
}
// Главная функция запуска и работы анимации игрвоого процесса
function animate() {
    // Запуск анимации
    window.requestAnimationFrame(animate)
    // Очищение рабочей области
    c.clearRect(0, 0, canvas.width, canvas.height)
    c.fillStyle = 'white'
    c.fillRect(0, 0, canvas.width, canvas.height)
    // Сохранение изначального масштаба отображения
    c.save()
    // Изменение масштаба отображения
    c.scale(CANVAS_SCALE, CANVAS_SCALE)
    // Сдвиг отображаемой области согласно позицие камеры
    c.translate(-camera.position.x, -camera.position.y)
    // Обновление положение блока игровой статистики
    playerStats.updatePosition({ position: camera.position })
    // Отображение уровня
    backgroundTestLevel.draw()
    // Обновление состояния персонажа
    player.update()
    // Проверка наличия возможности сбора какой-либо монеты
    coins.forEach(coin => {
        coin.tryCollect({ player: player })
        coin.draw()
    })
    // Обновление положения камеры
    player.updateCameraByPlayerCameraBox({ canvas: canvas, camera: camera, levelSizes: levelSizes })
    // Отображение фона скрытых локаций согласно текущему положению персонажа
    secretRooms.forEach(area => {
        area.updateAlpha({ playerSides: player.sides })
        area.drawBackground()
    })
    // Отображение персонажа
    player.draw()
    // Отображение стен скрытых локаций согласно текущему положению персонажа
    secretRooms.forEach(area => {
        area.drawWalls()
    })
    // Обработка нажатых клавиш
    key_processing()
    // Отображение блока игровой статистики
    playerStats.draw()
    // Возврат к изначальному масштабу отображения
    c.restore()
}
// Запуск анимации
animate()
