class Area {
    // Инициализация скрытой области по Sprite стен и фона, а также массива блоков области
    constructor({ areaWallSprite, areaBackgroundSprite, areaBlocks }) {
        this.areaBlocks = areaBlocks
        this.areaWallSprite = areaWallSprite
        this.areaBackgroundSprite = areaBackgroundSprite
        this.alpha = 1
    }

    // Подсчет площади пересечения
    calcAreaIntersection({ sides }) {
        let sumIntersection = 0
        this.areaBlocks.forEach(areaBlock => {
            sumIntersection += areaBlock.calcIntersection({ sides: sides })
        });
        return sumIntersection
    }

    // Подсчет коэффициента прозрачности
    updateAlpha({ playerSides }) {
        let regionArea = this.calcAreaIntersection({ sides: playerSides })
        let playerHeight = playerSides.bottom - playerSides.top
        let playerWidth = playerSides.right - playerSides.left
        this.alpha = 1 - 0.7 * regionArea / playerHeight / playerWidth
    }

    // Отображение стен скрытой области
    drawWalls() {
        this.areaWallSprite.drawWithTransparentAlpha({ alpha: this.alpha })
    }

    // Отображение фона скрытой области
    drawBackground() {
        this.areaBackgroundSprite.drawWithTransparentAlpha({ alpha: this.alpha })
    }
}
