class Player {
    // Инициализация игрвого персонажа
    constructor({ position, animationInfo, CollisionBlocks }) {
        // Запись информации для анимирования и проверки столкновений
        this.animationInfo = animationInfo
        this.CollisionBlocks = CollisionBlocks
        // Задание начальной позиции, скорости и ускорения
        this.position = {
            x: position.x,
            y: position.y
        }
        this.velocity = {
            x: 0,
            y: 0
        }
        // Ускорение положительно, поскольку вертикальная ось в canvas перевернута
        this.acceleration = {
            x: 0,
            y: DEFAULT_ACCELARATION
        }
        // Начальное число собранных монет
        this.collectedCoins = 0
        // Инициализация переменной анимаций для каждого состояния
        this.animations = {}
        // Цикл по всем состояниям
        for (let state in this.animationInfo.statesAssets) {
            this.animations[state] = {}
            // Цикл по всем направления для состояния цикла
            for (let facing in this.animationInfo.statesAssets[state]) {
                // Создание объекта анимации и запись в словарь  
                this.animations[state][facing] = new Sprite({
                    position: this.getImagePosition(),
                    imageSrc: this.animationInfo.statesAssets[state][facing].assetImgSrc,
                    frameRate: this.animationInfo.statesAssets[state][facing].frameRate,
                    frameDelay: this.animationInfo.statesAssets[state][facing].frameDelay,
                    scale: this.animationInfo.scale
                })
            }
        }
        // Задание размеров хитбокса и начальных координат сторон 
        this.width = (this.animationInfo.frameWidth - (this.animationInfo.hitboxMargin.fromLeft +
            this.animationInfo.hitboxMargin.fromRight)) * this.animationInfo.scale
        this.height = (this.animationInfo.frameHeight - (this.animationInfo.hitboxMargin.fromTop +
            this.animationInfo.hitboxMargin.fromBottom)) * this.animationInfo.scale
        this.sides = {
            bottom: this.position.y + this.height,
            top: this.position.y,
            left: this.position.x,
            right: this.position.x + this.width,
        }
        // Стили рисования хитбокса и камера в режиме отладки
        this.hitBoxStyle = 'rgba(0, 255, 0, 0.5)'
        this.cameraBoxStyle = 'rgba(0, 0, 255, 0.1)'
        // Состояние относительно блоков коллизии
        this.state = {
            top: false,
            bottom: false,
            left: false,
            leftPush: false,
            right: false,
            rightPush: false,
            onWall: false
        }
        // Состояние текущей и предыдущей анимации
        this.animationState = {
            action: 'standing',
            facing: 'right'
        }
        this.previousAnimationState = {
            action: this.animationState.action,
            facing: this.animationState.facing
        }
        // Объект камеры, следующей за персонажем
        this.cameraBox = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            sides: {
                bottom: this.position.y + 80,
                top: this.position.y,
                left: this.position.x,
                right: this.position.x + 200,
            },
            width: 200,
            height: 80
        }
        // Вспомогательные переменные расчета столкновений
        this.collisionTime = 1
        this.nearestCollisionBlocksX = []
        this.nearestCollisionBlocksY = []
        this.nearestCollisionBlockTimeX = Number.MAX_VALUE
        this.nearestCollisionBlockTimeY = Number.MAX_VALUE
        this.newPosition = {
            x: position.x,
            y: position.y
        }
        this.newPositionTime = 1
        this.newSides = this.sides
    }

    // Получение координат отображаемого кадра анимации
    getImagePosition() {
        return {
            x: this.position.x - this.animationInfo.hitboxMargin.fromLeft * this.animationInfo.scale,
            y: this.position.y - this.animationInfo.hitboxMargin.fromTop * this.animationInfo.scale
        }
    }

    // Прыжок при условии нахождения на поверхности
    jump() {
        if (this.state.bottom) {
            // Задание отрицательной скорость по вертикальной оси
            this.velocity.y = JUMP_VELOCITY
        }
    }

    // Движение вправо
    walkRight() {
        // Направление анимации меняется на право
        this.animationState.facing = 'right'
        // Обработка отскока от левой стены
        if (!this.state.bottom && !this.state.top && (this.state.left || this.state.leftPush)) {
            this.velocity.y = FROM_WALL_JUMP_VERTICAL_VELOCITY
        }
        // Задание положительной скорости по горизонтальной оси
        this.velocity.x = RIGHT_VELOCITY
    }

    // Движение влево
    walkLeft() {
        // Направление анимации меняется на лево
        this.animationState.facing = 'left'
        // Обработка отскока от правой стены
        if (!this.state.bottom && !this.state.top && (this.state.right || this.state.rightPush)) {
            this.velocity.y = FROM_WALL_JUMP_VERTICAL_VELOCITY
        }
        // Задание отрицательной скорости по горизонтальной оси
        this.velocity.x = LEFT_VELOCITY
    }

    // Остановка движения
    stopWalking() {
        this.velocity.x = 0
    }

    // Обновление ускорения
    updateAcceleration() {
        // Проверка скольжения по стене (игрок уперся в стену, а персонаж падает)
        if ((this.state.leftPush || this.state.rightPush) && this.velocity.y >= 0) {
            // Уменьшение ускорения при скольжении
            this.acceleration.y = ON_WALL_ACCELARATION
            // Обновление состояния скольжения
            this.state.onWall = true
        } else {
            // Проверка скольжения по стене (персонаж падает, находится около стены, и в состоянии скольжения)
            if ((this.state.left || this.state.right) && this.state.onWall && this.velocity.y >= 0) {
                // Сохранение ускорения при скольжении
                this.acceleration.y = ON_WALL_ACCELARATION
            } else {
                // Возврат к стандартному ускорению
                this.acceleration.y = DEFAULT_ACCELARATION
                // Сброс состояния скольжения
                this.state.onWall = false
            }
        }
    }

    // Обновление скорости
    updateVelocity() {
        // Наращивание скорость 
        this.velocity.y += this.acceleration.y
        // Проверка достижения максимальной допустимой скорости
        if (this.state.onWall && (this.velocity.y > ON_WALL_MAX_FALL_SPEED)) {
            // При скольжении
            this.velocity.y = ON_WALL_MAX_FALL_SPEED
        } else if (!this.state.onWall && (this.velocity.y > DEFAULT_MAX_FALL_SPEED)) {
            // При обычном падении
            this.velocity.y = DEFAULT_MAX_FALL_SPEED
        }
    }

    // Расчет предварительной новой позиции
    calculateNewPosition() {
        this.newPosition.x += this.velocity.x
        this.newPosition.y += this.velocity.y
    }

    // Получение координат сторон персонажа по позиции
    getSides(position) {
        return {
            bottom: position.y + this.height,
            top: position.y,
            left: position.x,
            right: position.x + this.width,
        }
    }

    // Проверка пересечений с блоками коллизии
    checkCollisions() {
        // Текущее время для достижения новой позиции
        this.collisionTime = 1
        // Время до столкновения с блоками коллизии по каждой оси
        this.newPositionTimeX = 1
        this.newPositionTimeY = 1
        // Ни один из блоков изначально не проверен ни по одной из осей
        this.CollisionBlocks.forEach((collisionItem) => {
            collisionItem.checkedX = false
            collisionItem.checkedY = false
        })
        while (this.collisionTime > 0) {
            // Обновление координат сторон хитбокса при текущей позиции 
            this.sides = this.getSides(this.position)
            // Получение ближайших по траектории движения блоков коллизии
            this.collectNearestCollisionBlocks()
            // Проверка углового столкновения
            if (this.nearestCollisionBlockTimeX == this.nearestCollisionBlockTimeY && this.nearestCollisionBlocksX.length == 1 && this.nearestCollisionBlocksY.length == 1) {
                this.checkAngleCollision({ collisionBlock: this.nearestCollisionBlocksX[0] })
            }
            // Проверка раннего столкновения по горизнотальной оси
            else if ((this.nearestCollisionBlockTimeX < this.nearestCollisionBlockTimeY) && this.nearestCollisionBlocksX.length != 0 && this.velocity.x != 0) {
                this.nearestCollisionBlocksX.forEach((collisionItem) => {
                    // Проверка пересечений по оси Ox
                    this.checkXCollision({ collisionBlock: collisionItem })
                    this.newSides = this.getSides(this.newPosition)
                })
            }
            // Проверка раннего столкновения по вертикальной оси
            else if ((this.nearestCollisionBlocksY.length != 0) && this.velocity.y != 0) {
                this.nearestCollisionBlocksY.forEach((collisionItem) => {
                    // Проверка пересечений по оси Oy
                    this.checkYCollision({ collisionBlock: collisionItem })
                    this.newSides = this.getSides(this.newPosition)
                })
            }
            // Отсутствие пересечений
            else {
                break
            }
        }
    }

    // Уравнение движения персонажа по оси Oy
    yFunc(t, startY) {
        return startY + this.velocity.y * t + this.acceleration.y * t * (t + 1) / 2
    }

    // Уравнение движения персонажа по оси Ox
    xFunc(t, startX) {
        return startX + this.velocity.x * t
    }

    // Вычисление точки пересечения персонажем вертикального препятствия
    calcIntersectionTimeByX(startX, collisionX) {
        return (collisionX - startX) / this.velocity.x
    }

    // Вычисление двух точек пересечения персонажем горизонтального препятствия
    calcIntersectionTimeByY(startY, collisionY) {
        if (this.acceleration.y == 0) {
            return {
                t1: (collisionY - startY) / this.velocity.y,
                t2: (collisionY - startY) / this.velocity.y
            }
        }
        let D = (this.velocity.y + this.acceleration.y / 2) * (this.velocity.y + this.acceleration.y / 2) -
            2 * this.acceleration.y * (collisionY - startY)
        if (D <= 0) {
            return {
                t1: 2,
                t2: 2
            }
        }
        let sqrtD = Math.sqrt(D)
        return {
            t1: (this.velocity.y + this.acceleration.y / 2 - sqrtD) / this.acceleration.y,
            t2: (this.velocity.y + this.acceleration.y / 2 + sqrtD) / this.acceleration.y
        }
    }

    // Сбор ближайших к персонажу по времени блоков  
    collectNearestCollisionBlocks() {
        // Обнуление переменных ближайших блоков коллизии 
        this.nearestCollisionBlocksX = []
        this.nearestCollisionBlocksY = []
        // Задание наибольшего времени достижения по текущей траектории блока по каждой из осей 
        this.nearestCollisionBlockTimeX = this.collisionTime
        this.nearestCollisionBlockTimeY = this.collisionTime
        // Обновление координат сторон новой позиции персонажа
        this.newSides = this.getSides(this.newPosition)
        // Проверка каждого блока коллизии на пересечение
        this.CollisionBlocks.forEach((collisionItem) => {
            this.checkNearestCollisionBlock({ collisionBlock: collisionItem })
        })
        // Отображение обрабатываемых блоков коллиции (в режиме отладки)
        if (IS_DEBUG) {
            this.nearestCollisionBlocksX.forEach((collisionBlock) => {
                collisionBlock.draw({ style: 'rgba(255, 0, 0, 0.5)' })
            })
            this.nearestCollisionBlocksY.forEach((collisionBlock) => {
                collisionBlock.draw({ style: 'rgba(0, 0, 255, 0.5)' })
            })
        }
    }

    // Проверка блока коллизии на пересечение
    checkNearestCollisionBlock({ collisionBlock }) {
        // Проверка необходимого условия пересечения с блоком
        // (блок пересекает область между текущей и новой позицией персонажа)
        if (collisionBlock.checkIntersction({ sides: this.sides, newSides: this.newSides })) {
            // Проводилась ли проверка столкновения с блоку по оси Ox
            if (!collisionBlock.checkedX) {
                let collisionTimeX = this.collisionTime
                // Обработка столкновения правым боком
                if (this.velocity.x > 0) {
                    let lct = this.calcIntersectionTimeByX(
                        this.sides.right, collisionBlock.sides.left)
                    if ((lct >= 0) && (lct <= this.newPositionTime) && (lct < collisionTimeX)) {
                        collisionTimeX = lct
                    }
                }
                // Обработка столкновения левым боком
                else if (this.velocity.x < 0) {
                    let lct = this.calcIntersectionTimeByX(
                        this.sides.left, collisionBlock.sides.right)
                    if ((lct >= 0) && (lct <= this.newPositionTime) && (lct < collisionTimeX)) {
                        collisionTimeX = lct
                    }
                }
                // Найденное пересечение ближе текущего лучшего 
                if (collisionTimeX < this.nearestCollisionBlockTimeX) {
                    // Пересоздание массива и обновление времени
                    this.nearestCollisionBlocksX = [collisionBlock]
                    this.nearestCollisionBlockTimeX = collisionTimeX
                    // Найденное пересечение совпадает с текущим лучшим
                } else if ((collisionTimeX == this.nearestCollisionBlockTimeX) && (collisionTimeX != this.collisionTime)) {
                    this.nearestCollisionBlocksX.push(collisionBlock)
                }
            }
            // Проводилась ли проверка столкновения с блоку по оси Oy
            if (!collisionBlock.checkedY) {
                let collisionTimeY = this.collisionTime
                // Обработка столкновения верхней стороной
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
                // Обработка столкновения нижней стороной
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
                // Найденное пересечение ближе текущего лучшего 
                if (collisionTimeY < this.nearestCollisionBlockTimeY) {
                    // Пересоздание массива и обновление времени
                    this.nearestCollisionBlocksY = [collisionBlock]
                    this.nearestCollisionBlockTimeY = collisionTimeY
                    // Найденное пересечение совпадает с текущим лучшим
                } else if ((collisionTimeY == this.nearestCollisionBlockTimeY) && (collisionTimeY != this.collisionTime)) {
                    this.nearestCollisionBlocksY.push(collisionBlock)
                }
            }
        }
    }

    // Проверка углового столкновения (особый случай пересечения)
    checkAngleCollision({ collisionBlock }) {
        // Попаданеие в угол при движении вверх
        if (this.velocity.y < 0) {
            // Столкновение с вертикальной стороной (Приоритет - движение вверх) 
            if (this.velocity.x > 0) {
                this.position.x = collisionBlock.sides.left - this.width
                this.newPosition.x = this.position.x
            } else {
                this.position.x = collisionBlock.sides.right
                this.newPosition.x = this.position.x
            }
            this.velocity.x = 0
            // Попаданеие в угол при движении вниз
        } else {
            // Столкновение с горизонтальной стороной (пол) (Приоритет - движение по горизонтали)
            this.position.y = collisionBlock.sides.top - this.height
            this.newPosition.y = this.position.y
            this.velocity.y = 0
        }
    }

    // Проверка и обновление позиции и скорости при столкновении с вертикальной стороной блока коллизии 
    checkXCollision({ collisionBlock }) {
        // Время столкновения
        let collisionTime = this.nearestCollisionBlockTimeX
        // Обработка столкновения правым боком
        if (this.velocity.x > 0) {
            // Проверка строго пересечения сторон по линии столкновения
            if ((this.yFunc(collisionTime, this.sides.bottom) > collisionBlock.sides.top) &&
                (this.yFunc(collisionTime, this.sides.top) < collisionBlock.sides.bottom)) {
                // Сдвиг к блоку пересечения
                this.position.x = collisionBlock.sides.left - this.width
                this.newPosition.x = this.position.x
                // Сброс горизонтальной скорости
                this.velocity.x = 0
                // Игрок давит в правую стену
                this.state.rightPush = true
            } else {
                // Блок проверен по оси Ox
                collisionBlock.checkedX = true
            }
        }
        // Обработка столкновения левым боком
        else if (this.velocity.x < 0) {
            // Проверка строго пересечения сторон по линии столкновения
            if ((this.yFunc(collisionTime, this.sides.bottom) > collisionBlock.sides.top) &&
                (this.yFunc(collisionTime, this.sides.top) < collisionBlock.sides.bottom)) {
                // Сдвиг к блоку пересечения
                this.position.x = collisionBlock.sides.right
                this.newPosition.x = this.position.x
                // Сброс горизонтальной скорости
                this.velocity.x = 0
                // Игрок давит в левую стену
                this.state.leftPush = true
            } else {
                // Блок проверен по оси Ox
                collisionBlock.checkedX = true
            }
        }
    }

    checkYCollision({ collisionBlock }) {
        let collisionTime = this.nearestCollisionBlockTimeY
        // Обработка столкновения верхней стороной
        if (this.velocity.y < 0) {
            // Проверка строго пересечения сторон по линии столкновения
            if ((this.xFunc(collisionTime, this.sides.left) < collisionBlock.sides.right) &&
                (this.xFunc(collisionTime, this.sides.right) > collisionBlock.sides.left)) {
                // Сдвиг к блоку пересечения
                this.position.y = collisionBlock.sides.bottom
                this.newPosition.y = this.position.y
                // Сброс вертикальной скорости
                this.velocity.y = 0
            } else {
                // Блок проверен по оси Oy
                collisionBlock.checkedY = true
            }
        }
        // Обработка столкновения нижней стороной
        else if (this.velocity.y > 0) {
            // Проверка строго пересечения сторон по линии столкновения
            if ((this.xFunc(collisionTime, this.sides.left) < collisionBlock.sides.right) &&
                (this.xFunc(collisionTime, this.sides.right) > collisionBlock.sides.left)) {
                // Сдвиг к блоку пересечения
                this.position.y = collisionBlock.sides.top - this.height
                this.newPosition.y = this.position.y
                // Сброс вертикальной скорости
                this.velocity.y = 0
            } else {
                // Блок проверен по оси Oy
                collisionBlock.checkedY = true
            }
        }
    }

    // Отображение области камеры (режим отладки)
    drawCameraBox() {
        c.fillStyle = this.cameraBoxStyle
        c.fillRect(
            this.cameraBox.position.x,
            this.cameraBox.position.y,
            this.cameraBox.width,
            this.cameraBox.height
        )
    }

    // Обновление позиции и координат сторон камеры согласно текущей позиции персонажа
    updateCameraBox() {
        this.cameraBox = {
            position: {
                x: this.position.x - (this.cameraBox.width - this.width) / 2,
                y: this.position.y - (this.cameraBox.height - this.height) / 2,
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
        if (IS_DEBUG) {
            this.drawCameraBox()
        }
    }

    // Обновление камеры сдвига отображаемой области при пересечении cameraBox сторон холста
    updateCameraByPlayerCameraBox({ canvas, camera, levelSizes }) {
        // Пересечение правой стороны холста
        if (this.cameraBox.sides.right > camera.position.x + canvas.width / CANVAS_SCALE) {
            camera.position.x = this.cameraBox.sides.right - canvas.width / CANVAS_SCALE
        }
        // Пересечение левой стороны холста
        if (this.cameraBox.sides.left < camera.position.x) {
            camera.position.x = this.cameraBox.sides.left
        }
        // Пересечение верхней стороны холста
        if (this.cameraBox.sides.top < camera.position.y) {
            camera.position.y = this.cameraBox.sides.top
        }
        // Пересечение нижней стороны холста
        if (this.cameraBox.sides.bottom > canvas.height / CANVAS_SCALE + camera.position.y) {
            camera.position.y = this.cameraBox.sides.bottom - canvas.height / CANVAS_SCALE
        }
        // Сброс измений при достижении краев изображения карты
        if (camera.position.x < 0) {
            camera.position.x = 0
        }
        if (camera.position.x + canvas.width / CANVAS_SCALE > levelSizes.width) {
            camera.position.x = levelSizes.width - canvas.width / CANVAS_SCALE
        }
        if (camera.position.y < 0) {
            camera.position.y = 0
        }
        if (camera.position.y + canvas.height / CANVAS_SCALE > levelSizes.height) {
            camera.position.y = levelSizes.height - canvas.height / CANVAS_SCALE
        }
    }

    // Сброс состояний персонажа 
    // (с сохранением свойства скольжения по стене)
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

    // Обновление состояния по ближайших расположенным блокам
    updateState() {
        // Цикл по всем блокам коллизии
        this.CollisionBlocks.forEach((collisionItem) => {
            // Проверка наличия пересечения хотя бы по стороне
            if (collisionItem.checkIntersctionWithBounds({ sides: this.sides, newSides: this.sides })) {
                if (this.sides.left < collisionItem.sides.right && this.sides.right > collisionItem.sides.left) {
                    // Касание верхней стороной
                    if (this.sides.top == collisionItem.sides.bottom) {
                        this.state.top = true
                    }
                    // Касание нижней стороной
                    if (this.sides.bottom == collisionItem.sides.top) {
                        this.state.bottom = true
                    }
                }
                if (this.sides.top < collisionItem.sides.bottom && this.sides.bottom > collisionItem.sides.top) {
                    // Касание левой стороной
                    if (this.sides.left == collisionItem.sides.right) {
                        this.state.left = true
                    }
                    // Касание правой стороной
                    if (this.sides.right == collisionItem.sides.left) {
                        this.state.right = true
                    }
                }
            }
        })
    }

    // Обновление состояния анимации персонажа
    updateAnimationState() {
        // При остуствии скорости по обеим осям и нахождении на поверхности - состояние покоя
        if (this.state.bottom && this.velocity.x == 0 && this.velocity.y == 0) {
            this.animationState.action = 'standing'
        }
        // При остуствии скорости только по вертикальной оси и нахождении на поверхности - состояние хотьбы
        else if (this.state.bottom && this.velocity.x != 0 && this.velocity.y == 0) {
            this.animationState.action = 'moving'
        }
        // При нахождении на левой стене в скольжении и положительной скорости по оси Oy - состояние скольжения с направлением вправо 
        else if (this.state.left && this.state.onWall && this.velocity.y > 0) {
            this.animationState.action = 'wallSliding'
            this.animationState.facing = 'right'
        }
        // При нахождении на правой стене в скольжении и положительной скорости по оси Oy - состояние скольжения с направлением влево
        else if (this.state.right && this.state.onWall && this.velocity.y > 0) {
            this.animationState.action = 'wallSliding'
            this.animationState.facing = 'left'
        }
        // При положительной скорости по оси Oy - состояние падения 
        else if (this.velocity.y > 0) {
            this.animationState.action = 'falling'
        }
        // При отрицательной скорости по оси Oy - состояние прыжка 
        else if (this.velocity.y < 0) {
            this.animationState.action = 'jumping'
        }
        // При нулевой скорости по оси Oy - сохранение предыдущего состояния 
        else if (this.velocity.y == 0) {
            this.animationState.action = this.animationState.action
        }
        // Встречена неожиданная конфигурация скорости и состояний
        else {
            console.log(this.velocity)
            this.animationState.action = '???'
        }
    }

    // Обновление состояния персонажа
    update() {
        this.updateAcceleration()
        this.updateVelocity()
        this.calculateNewPosition()
        this.resetState()
        this.checkCollisions()
        this.sides = this.getSides(this.newPosition)
        this.position = {
            x: this.newPosition.x,
            y: this.newPosition.y
        }
        this.updateCameraBox()
        this.updateState()
        this.updateAnimationState()
    }

    // Отображение хитбокса персонажа (режим отладки)
    drawHitBox() {
        c.fillStyle = this.hitBoxStyle
        c.fillRect(
            this.sides.left,
            this.sides.top,
            this.width,
            this.height
        )
    }

    // Отображение текущего кадра анимации игрового персонажа
    draw() {
        // Проверка наличия требуемого состояния анимации
        if (this.animationState.action in this.animations) {
            if (this.animationState.facing in this.animations[this.animationState.action]) {
                // Обновление положения изображения
                this.animations[this.animationState.action][this.animationState.facing].updatePosition({ position: this.getImagePosition() })
                // Проверка необходимости сброса анимации 
                // (Начало новой анимации, текущее состояние отличается от предыдущего)
                if (this.previousAnimationState.action == this.animationState.action &&
                    this.previousAnimationState.facing == this.animationState.facing) {
                    // Обновление объекта анимации 
                    this.animations[this.animationState.action][this.animationState.facing].update()
                } else {
                    // Сброс объекта анимации
                    this.animations[this.animationState.action][this.animationState.facing].resetAnimation()
                }
                // Отображение кадра анимации
                this.animations[this.animationState.action][this.animationState.facing].draw()
            } else {
                this.drawHitBox();
            }
        } else {
            this.drawHitBox();
        }

        if (IS_DEBUG) {
            this.drawHitBox()
        }
        // Сохранение текущего состояния анимации
        this.previousAnimationState = {
            action: this.animationState.action,
            facing: this.animationState.facing
        }
    }
}
