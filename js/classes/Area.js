class Area {
    constructor({ areaWallSprite, areaBackgroundSprite, areaBlocks }) {
        this.areaBlocks = areaBlocks
        this.areaWallSprite = areaWallSprite
        this.areaBackgroundSprite = areaBackgroundSprite
        this.alpha = 1
    }
    calcAreaIntersection({ sides }) {
        let sumIntersection = 0
        this.areaBlocks.forEach(areaBlock => {
            sumIntersection += areaBlock.calcIntersection({ sides: sides })
        });
        return sumIntersection
    }
    updateAlpha({ playerSides }) {
        this.alpha = 1 - 0.7 * this.calcAreaIntersection({ sides: playerSides }) / (playerSides.bottom - playerSides.top) / (playerSides.right - playerSides.left)
    }
    drawWalls() {
        this.areaWallSprite.drawWithTransparentAlpha({ alpha: this.alpha })
    }
    drawBackground() {
        this.areaBackgroundSprite.drawWithTransparentAlpha({ alpha: this.alpha })
    }
}
