class GrassBlade {
    constructor(x, y) {
      this.x = x + random(-6.25, 6.25);
      this.baseY = y + random(-12.5, 12.5);
      this.height = random([12.5, 18.75, 25, 31.25]);
      this.width = 6.25;
      this.color = '#2E8B57';
    }
    
    draw(p) {
      p.fill(this.color);
      p.rect(this.x, this.baseY, this.width, this.height - 6.25);
      let offset = p.round(p.cos(p.windAngle)) * 6.25;
      p.rect(this.x + offset, this.baseY, this.width, 6.25);
    }
  
    isInFrontOfDuck(duckX, duckY) {
      return (
        Math.abs(this.x - duckX) < 18.75 &&
        this.baseY > duckY - 6.25 &&
        this.baseY < duckY + 18.75
      );
    }
  
    isInFrontOfApple(appleX, appleY) {
      return (
        Math.abs(this.x - appleX) < 18.75 &&
        this.baseY > appleY - 6.25 &&
        this.baseY < appleY + 18.75
      );
    }
  }
  
  export default GrassBlade;