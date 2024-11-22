class Pigeon {
    constructor() {
      this.x = -50;
      this.y = -50;
      this.active = false;
      this.speed = 3;
      this.direction = 0;
      this.hasGreeted = false;
      this.showDialog = false;
    }
  
    draw() {
      if (!this.active) return;
      
      drawShadow(this.x, this.y, 1);
      fill('#808080');
      
      // Body
      rect(this.x - 25, this.y - 50, 50, 50);
      rect(this.x - 37.5, this.y - 43.75, 31.25, 31.25);
      rect(this.x + 6.25, this.y - 43.75, 31.25, 31.25);
      rect(this.x - 18.75, this.y - 75, 37.5, 18.75);
      
      // Eye and Beak
      if (this.direction <= 0) {
        fill('#000000');
        rect(this.x - 12.5, this.y - 68.75, 6.25, 6.25);
        fill('#FF0000');
        rect(this.x, this.y - 68.75, 6.25, 6.25);
      } else {
        fill('#000000');
        rect(this.x + 6.25, this.y - 68.75, 6.25, 6.25);
        fill('#FF0000');
        rect(this.x - 6.25, this.y - 68.75, 6.25, 6.25);
      }
      
      fill('#4B0082');
      rect(this.x - 6.25, this.y - 62.5, 12.5, 6.25);
      
      fill('#FF6B6B');
      rect(this.x - 12.5, this.y, 6.25, 12.5);
      rect(this.x + 6.25, this.y, 6.25, 12.5);
    }
  
    update(duckX, duckY, score) {
      if (!this.active && score >= 10) {
        this.activate();
      }
  
      if (this.active) {
        let dx = duckX - this.x;
        let dy = duckY - this.y;
        let dist = sqrt(dx * dx + dy * dy);
        
        if (dist > 75) {
          this.x += (dx / dist) * this.speed;
          this.y += (dy / dist) * this.speed;
          this.direction = dx > 0 ? 1 : -1;
          this.showDialog = false;
        } else if (!this.hasGreeted) {
          this.showDialog = true;
          this.hasGreeted = true;
        }
      }
    }
  
    activate() {
      this.active = true;
      let side = floor(random(4));
      switch(side) {
        case 0: this.x = random(width); this.y = -50; break;
        case 1: this.x = width + 50; this.y = random(height); break;
        case 2: this.x = random(width); this.y = height + 50; break;
        case 3: this.x = -50; this.y = random(height); break;
      }
    }
  }
  
  export default Pigeon;