<template>
    <div id='dice1' class="dice dice-one aw-cursor-pointer" @click="rollDice" title="Let's Roll !">
        <div id="dice-one-side-one" class='side one'>
        <div class="dot one-1"></div>
        </div>
        <div id="dice-one-side-two" class='side two'>
        <div class="dot two-1"></div>
        <div class="dot two-2"></div>
        </div>
        <div id="dice-one-side-three" class='side three'>
        <div class="dot three-1"></div>
        <div class="dot three-2"></div>
        <div class="dot three-3"></div>
        </div>
        <div id="dice-one-side-four" class='side four'>
        <div class="dot four-1"></div>
        <div class="dot four-2"></div>
        <div class="dot four-3"></div>
        <div class="dot four-4"></div>
        </div>
        <div id="dice-one-side-five" class='side five'>
        <div class="dot five-1"></div>
        <div class="dot five-2"></div>
        <div class="dot five-3"></div>
        <div class="dot five-4"></div>
        <div class="dot five-5"></div>
        </div>
        <div id="dice-one-side-six" class='side six'>
        <div class="dot six-1"></div>
        <div class="dot six-2"></div>
        <div class="dot six-3"></div>
        <div class="dot six-4"></div>
        <div class="dot six-5"></div>
        <div class="dot six-6"></div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    dice: { type: Object, required: true }
});
</script>

<script>


export default
{
    data() {
        return {
        }
    },
    mounted() 
    {
    },
    methods:
    {
        rollDice() 
        {
            var elDiceOne       = document.getElementById('dice1');

            // Crée un tableau de 1 entier de 8 bits non signé
            const array = new Uint8Array(1);
            // Remplit le tableau avec des valeurs aléatoires
            window.crypto.getRandomValues(array);
            
            // Retourne un nombre entre 1 et 6 en utilisant le modulo 6 et en ajoutant 1
            const oldvalue = this.dice.value
            this.dice.value = (array[0] % 6) + 1;

            if(oldvalue == this.dice.value)
            {
                console.log('meme value')
                //on affiche le premier nombre qui n'est pas celui trouvé juste pour forcer l'animation du dé
                var shown = false
                for (var i = 1; i <= 6; i++) 
                {
                    elDiceOne.classList.remove('show-' + i);
                    if (this.dice.value != i && !shown) {
                        elDiceOne.classList.add('show-' + i);
                        shown = true
                    }
                }
                setTimeout(() => {
                    for (var i = 1; i <= 6; i++) 
                    {
                        elDiceOne.classList.remove('show-' + i);
                        if (this.dice.value === i) {
                            elDiceOne.classList.add('show-' + i);
                        }
                    }
                    setTimeout(() => this.$emit('dicerolled'), 1000)
                }, 1000)
                return
            }

            for (var i = 1; i <= 6; i++) 
            {
                elDiceOne.classList.remove('show-' + i);
                if (this.dice.value === i) {
                    elDiceOne.classList.add('show-' + i);
                }
            }

            setTimeout(() => this.$emit('dicerolled'), 1000)
        }
    }
}
</script>


<style scoped>
.dice {
  position: relative;
  width: 75px;
  height: 75px;
  transform-style: preserve-3d;
  transition: transform 1s; 
}

.dot {
  position: absolute;
  width: 15px;
  height: 15px;
  margin: -10px 5px 5px -10px;
  border-radius: 20px;
  background-color: #f25f5c;
  box-shadow: inset 2px 2px #d90429;
}

.dice-one {
  position: absolute;
  left: 150px; 
}

.side {
  position: absolute;
  background-color: #ffF;
  border-radius:5px;
  width: 75px;
  height: 75px;
  border: 1px solid #e5e5e5;
  text-align: center;
  line-height: 2em;
}

.side:nth-child(1) {
  transform: translateZ(1.9em); }

.side:nth-child(6) {
  transform: rotateY(90deg) translateZ(1.9em); }

.side:nth-child(3) {
  transform: rotateY(-90deg) translateZ(1.9em); }

.side:nth-child(4) {
  transform: rotateX(90deg) translateZ(1.9em); }

.side:nth-child(5) {
  transform: rotateX(-90deg) translateZ(1.9em); }

.side:nth-child(2) {
  transform: rotateY(-180deg) translateZ(1.9em); }

.show-1 {
  transform: rotateX(720deg) rotateZ(-720deg); }

.show-2 {
  transform: rotateX(-900deg) rotateZ(1080deg); }

.show-3 {
  transform: rotateY(810deg) rotateZ(720deg); }

.show-4 {
  transform: rotateX(-810deg) rotateZ(-1080deg); }

.show-5 {
  transform: rotateX(450deg) rotateZ(-720deg); 
}
.show-6 {
  transform: rotateY(-450deg) rotateZ(-1440deg); }


.two-1, .three-1, .four-1, .five-1, .six-1 {
    top: 20px;
    left: 20px;
}

.four-3, .five-3, .six-4 {
    top: 20px;
    right: 3px;
}

.one-1, .three-2, .five-5 {
    top: 55%;
    left: 53%;
}

.four-2, .five-2, .six-3 {
    bottom: 3px;
    left: 20px;
}

.two-2, .three-3, .four-4, .five-4, .six-6 {
    bottom: 3px;
    right: 3px;
}

.six-2 {
    top: 40px;
    left: 20px;
}

.six-5 {
    top: 40px;
    right: 3px;
}
</style>