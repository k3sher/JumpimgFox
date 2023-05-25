class Area {
    constructor({areaSprite, areaBlocks}) {
        this.areaBlocks = areaBlocks
        this.areaSprite = areaSprite
    }
    calcAreaIntersection({sides}) {
        let sumIntersection = 0
        this.areaBlocks.forEach(areaBlock => {
            sumIntersection += areaBlock.calcIntersection({sides: sides})
        });
        return sumIntersection
    }
    draw({playerSides}){
        let alpha = 1 - 0.7 * this.calcAreaIntersection({sides: playerSides}) / (playerSides.bottom - playerSides.top) /  (playerSides.right - playerSides.left)
        this.areaSprite.drawWithTransparentAlpha({alpha: alpha})
    }
}