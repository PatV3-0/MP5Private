enum EquipmentTypes{
    Weapon, Armour 
}

class Equipment{
    public name: string;
    public durability: number;

    constructor(name: string, durability: number){
        this.name = name;
        this.durability = durability;
    }
}

class Weapon extends Equipment{
    public dmg: number;

    constructor(name: string, durability: number, dmg: number){
        super(name, durability);
        this.dmg = dmg;
    }
}

class Armour extends Equipment{
    public def: number;

    constructor(name: string, durability: number, def: number){
        super(name, durability);
        this.def = def;
    }
}

export default class Player{
    private name: string;
    private hp: number;
    private def: number;
    private xp: number;
    private equip: Map<EquipmentTypes, Equipment>;
    
    constructor(name: string){
        this.name = name;
        this.hp = 100;
        this.def = 8;
        this.xp = 0;

        this.equip = new Map(); 
        this.equip.set(EquipmentTypes.Weapon, new Weapon("Wooden Sword", 5, 5));
        this.equip.set(EquipmentTypes.Armour, new Armour("Leather Set", 10, 7));

    }

    public takeDamage(dmg: number){

        if(this.hp <= 0){
            return;
        }

        let totalDefense: number = this.def;

        const arm = this.equip.get(EquipmentTypes.Armour) as Armour; //cast
        if(arm){
            totalDefense += arm.def*arm.durability;
            arm.durability *= 0.8;
            // console.log(`Total defense: ${totalDefense}`);
            console.log(`Armour Durability Left: ${arm.durability}`);
        }

        dmg -= totalDefense;

        if(dmg <= 0){
            return;
        }

        this.hp -= dmg;
        if(this.hp <= 0){
            console.log(`\n --- ${this.name} Died! ---\n`);
            return;
        }

        console.log(`${this.name} took damage, ${this.hp} HP Left!`);

        console.log(`Turn Over!\n---------------------------------------------------------\n`);
    }
}