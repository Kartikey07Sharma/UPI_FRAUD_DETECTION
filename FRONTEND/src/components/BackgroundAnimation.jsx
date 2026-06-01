import React, { useEffect, useRef } from 'react';

const BackgroundAnimation = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.radius = Math.random() * 3 + 1.5;
        // Randomly pick cyan or emerald for particle
        this.isCyan = Math.random() > 0.5;
      }

      update() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off edges smoothly
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.isCyan ? 'rgba(14, 165, 233, 0.9)' : 'rgba(16, 185, 129, 0.9)';
        ctx.fill();
        
        // Add a strong glow to particles
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.isCyan ? 'rgba(14, 165, 233, 1)' : 'rgba(16, 185, 129, 1)';
      }
    }

    const initParticles = () => {
      particles = [];
      // Adjust density based on screen size (fewer on mobile to save performance)
      const numParticles = Math.floor((canvas.width * canvas.height) / 10000);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
      // Reset shadow for lines
      ctx.shadowBlur = 0;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Connect particles if they are close enough
          if (distance < 160) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            
            // Opacity fades as distance increases
            const opacity = 1 - distance / 160;
            
            // Create a gradient line between the two dots
            const gradient = ctx.createLinearGradient(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
            gradient.addColorStop(0, particles[i].isCyan ? `rgba(14, 165, 233, ${opacity * 0.8})` : `rgba(16, 185, 129, ${opacity * 0.8})`);
            gradient.addColorStop(1, particles[j].isCyan ? `rgba(14, 165, 233, ${opacity * 0.8})` : `rgba(16, 185, 129, ${opacity * 0.8})`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      drawLines();
      
      animationFrameId = requestAnimationFrame(animate);
    };

    // Delay initialization slightly to ensure canvas is painted
    setTimeout(() => {
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();
      animate();
    }, 100);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="bg-animation-container"
      style={{ opacity: 0.9 }}
    />
  );
};

export default BackgroundAnimation;
