import Player from './player';

const p1 = new Player("Player One");
console.log("=== Game Start ===\n")
for(var i = 0; i < 10; i++){
    p1.takeDamage(100);
}