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
      
      window.drawShadow(this.x, this.y, 1);
      window.fill('#808080');
      
      // Body
      window.rect(this.x - 25, this.y - 50, 50, 50);
      window.rect(this.x - 37.5, this.y - 43.75, 31.25, 31.25);
      window.rect(this.x + 6.25, this.y - 43.75, 31.25, 31.25);
      window.rect(this.x - 18.75, this.y - 75, 37.5, 18.75);
      
      // Eye and Beak
      if (this.direction <= 0) {
        window.fill('#000000');
        window.rect(this.x - 12.5, this.y - 68.75, 6.25, 6.25);
        window.fill('#FF0000');
        window.rect(this.x, this.y - 68.75, 6.25, 6.25);
      } else {
        window.fill('#000000');
        window.rect(this.x + 6.25, this.y - 68.75, 6.25, 6.25);
        window.fill('#FF0000');
        window.rect(this.x - 6.25, this.y - 68.75, 6.25, 6.25);
      }
      
      window.fill('#4B0082');
      window.rect(this.x - 6.25, this.y - 62.5, 12.5, 6.25);
      
      window.fill('#FF6B6B');
      window.rect(this.x - 12.5, this.y, 6.25, 12.5);
      window.rect(this.x + 6.25, this.y, 6.25, 12.5);
    }
  
    update(duckX, duckY, score) {
      if (!this.active && score >= 10) {
        this.activate();
      }
  
      if (this.active) {
        let dx = duckX - this.x;
        let dy = duckY - this.y;
        let dist = window.sqrt(dx * dx + dy * dy);
        
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
      let side = window.floor(window.random(4));
      switch(side) {
        case 0: this.x = window.random(window.width); this.y = -50; break;
        case 1: this.x = window.width + 50; this.y = window.random(window.height); break;
        case 2: this.x = window.random(window.width); this.y = window.height + 50; break;
        case 3: this.x = -50; this.y = window.random(window.height); break;
      }
    }
  }
  
  export default Pigeon;