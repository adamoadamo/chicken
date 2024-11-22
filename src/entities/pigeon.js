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
  
    draw(p, drawShadow) {
      if (!this.active) return;
      
      drawShadow(this.x, this.y, 1);
      p.fill('#808080');
      
      // Body
      p.rect(this.x - 25, this.y - 50, 50, 50);
      p.rect(this.x - 37.5, this.y - 43.75, 31.25, 31.25);
      p.rect(this.x + 6.25, this.y - 43.75, 31.25, 31.25);
      p.rect(this.x - 18.75, this.y - 75, 37.5, 18.75);
      
      // Eye and Beak
      if (this.direction <= 0) {
        p.fill('#000000');
        p.rect(this.x - 12.5, this.y - 68.75, 6.25, 6.25);
        p.fill('#FF0000');
        p.rect(this.x, this.y - 68.75, 6.25, 6.25);
      } else {
        p.fill('#000000');
        p.rect(this.x + 6.25, this.y - 68.75, 6.25, 6.25);
        p.fill('#FF0000');
        p.rect(this.x - 6.25, this.y - 68.75, 6.25, 6.25);
      }
      
      p.fill('#4B0082');
      p.rect(this.x - 6.25, this.y - 62.5, 12.5, 6.25);
      
      p.fill('#FF6B6B');
      p.rect(this.x - 12.5, this.y, 6.25, 12.5);
      p.rect(this.x + 6.25, this.y, 6.25, 12.5);
    }
  
    update(p, duckX, duckY, score) {
      if (!this.active && score >= 10) {
        this.activate(p);
      }
  
      if (this.active) {
        let dx = duckX - this.x;
        let dy = duckY - this.y;
        let dist = p.sqrt(dx * dx + dy * dy);
        
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
  
    activate(p) {
      this.active = true;
      let side = p.floor(p.random(4));
      switch(side) {
        case 0: this.x = p.random(p.width); this.y = -50; break;
        case 1: this.x = p.width + 50; this.y = p.random(p.height); break;
        case 2: this.x = p.random(p.width); this.y = p.height + 50; break;
        case 3: this.x = -50; this.y = p.random(p.height); break;
      }
    }
  }
  
  export default Pigeon;