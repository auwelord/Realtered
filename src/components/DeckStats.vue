<template>
    <Bar v-if="chartCost" :options="chartCost.chartOptions" :data="chartCost.chartData" />
    <Bar v-if="chartTotalCost" :options="chartTotalCost.chartOptions" :data="chartTotalCost.chartData" class="mt-2" />
    <Bar v-if="chartStat" :options="chartStat.chartOptions" :data="chartStat.chartData" class="mt-5" />
    <Bar v-if="chartTotalStat" :options="chartTotalStat.chartOptions" :data="chartTotalStat.chartData" class="mt-2" />
    <Pie v-if="chartType" :options="chartType.chartOptions" :data="chartType.chartData" class="mt-5" />    
</template>

<script>
import { Bar, Pie } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'

ChartJS.register(Title, Tooltip, Legend, BarElement, ArcElement, CategoryScale, LinearScale)

export default {
    props: {
        currentDeck: {
            type: Object,
            required: true
        }
    },
    components: { Bar, Pie },
    mounted() {
    },
    data() {
        return {
            chartCost : {
                chartData: {
                    labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "10+"],
                    datasets: [
                        {
                            label: "Coût de main",
                            data: this.getQuantiteMainCost(),
                            borderColor: "white",
                            backgroundColor: this.g_getFactionColorFromDeck(this.currentDeck),
                        },
                        {
                            label: "Coût de réserve",
                            data: this.getQuantiteRecallCost(),
                            borderColor: "white",
                            backgroundColor: "#FFB410",
                        }
                    ]
                },
                chartOptions: {
                    responsive: true,
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Coût en mana',
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Nombre de cartes',
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Coûts',
                        },
                        legend: {
                            title: {
                                display: false
                            }
                        }
                    }
                }
            },
            chartTotalCost: {
                chartData: {
                    labels: ["Coût total"],
                    datasets: [
                        {
                            label: "Coût total de main",
                            data: [this.getCoutTotalMain()],
                            borderColor: "white",
                            backgroundColor: this.g_getFactionColorFromDeck(this.currentDeck),
                        },
                        {
                            label: "Coût total de réserve",
                            data: [this.getCoutTotalReserve()],
                            borderColor: "white",
                            backgroundColor: "#FFB410",
                        }
                    ]
                },
                chartOptions: {
                    responsive: true,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: false,
                                text: 'Coût en mana',
                            }
                        },
                        y: {
                            display: false                            
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Coûts',
                        },
                        legend: {
                            title: {
                                display: false
                            }
                        }
                    }
                }
            },
            chartType: {
                chartData: {
                    labels: ['Personnage', 'Sort', 'Permanent'],
                    datasets: [
                        {
                            label: 'Nombre de cartes',
                            data: this.getQuantiteTypes(),
                            backgroundColor: ['#8549ba', '#4dc9f6', '#f67019'],
                        }
                    ]
                },
                chartOptions: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'top',
                        },
                        title: {
                            display: true,
                            text: 'Proportions par types'
                        }
                    }
                }
            },
            chartTotalStat: {
                chartData: {
                    labels: ["Coût total"],
                    datasets: [
                        {
                            label: "Patates en forêt",
                            data: [this.getStatTotalForest()],
                            borderColor: "white",
                            backgroundColor: this.g_colorForest(),
                        },
                        {
                            label: "Patates en montagne",
                            data: [this.getStatTotalMountain()],
                            borderColor: "white",
                            backgroundColor: this.g_colorMountain(),
                        }
                        ,
                        {
                            label: "Patates en océan",
                            data: [this.getStatTotalOcean()],
                            borderColor: "white",
                            backgroundColor: this.g_colorWater(),
                        }
                    ]
                },
                chartOptions: {
                    responsive: true,
                    indexAxis: 'y',
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: false,
                                text: 'Coût en mana',
                            }
                        },
                        y: {
                            display: false                            
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Patates totales par biôme',
                        },
                        legend: {
                            title: {
                                display: false
                            }
                        }
                    }
                }
            },
            chartStat: {
                chartData: {
                    labels: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, "10+"],
                    datasets: [
                        {
                            label: "Forêt",
                            data: this.getQuantiteStatForet(),
                            borderColor: "white",
                            backgroundColor: this.g_colorForest(),
                        },
                        {
                            label: "Montagne",
                            data: this.getQuantiteStatMountain(),
                            borderColor: "white",
                            backgroundColor: this.g_colorMountain(),
                        }
                        ,
                        {
                            label: "Océan",
                            data: this.getQuantiteStatWater(),
                            borderColor: "white",
                            backgroundColor: this.g_colorWater(),
                        }
                    ]
                },
                chartOptions: {
                    responsive: true,
                    scales: {
                        x: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Patate',
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: 'Nombre de cartes',
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: 'Patates par biôme',
                        },
                        legend: {
                            title: {
                                display: false
                            }
                        }
                    }
                }
            }
        }
    },
    methods: {
        getCoutTotalMain(){
            var cout = 0;
            this.currentDeck.cards.forEach(card => {
                if (!this.g_isHero(card)) cout += card.mainCost;
            });
            return cout;
        },
        getCoutTotalReserve(){
            var cout = 0;
            this.currentDeck.cards.forEach(card => {
                if (!this.g_isHero(card)) cout += card.recallCost;
            });
            return cout;
        },
        getQuantiteMainCost() {
            var tab = [];
            for (let cost = 0; cost <= 10; cost++) {
                var nbcards = 0;
                this.currentDeck.cards.forEach(card => {
                    if (!this.g_isHero(card) &&
                        (card.mainCost == cost || (cost == 10 && card.mainCost > 10))) nbcards += card.quantite;
                });
                tab.push(nbcards);
            }

            return tab;
        },
        getQuantiteRecallCost() {
            var tab = [];
            for (let cost = 0; cost <= 10; cost++) {
                var nbcards = 0;
                this.currentDeck.cards.forEach(card => {
                    if (!this.g_isHero(card) &&
                        (card.recallCost == cost || (cost == 10 && card.recallCost > 10))) nbcards += card.quantite;
                });
                tab.push(nbcards);
            }

            return tab;
        },
        getQuantiteTypes() {
            var tab = [0, 0, 0];

            this.currentDeck.cards.forEach(card => {
                if (this.g_isPersonnage(card)) tab[0] += card.quantite;
                else if (this.g_isSort(card)) tab[1] += card.quantite;
                else if (this.g_isPermanent(card)) tab[2] += card.quantite;
            });

            return tab;
        },
        getQuantiteStatForet() {
            var tab = [];
            for (let patate = 0; patate <= 10; patate++) {
                var nbcards = 0;
                this.currentDeck.cards.forEach(card => {
                    if (this.g_isPersonnage(card) && 
                        (card.forestPower == patate || (patate == 10 && card.forestPower > 10))) nbcards += card.quantite;
                });
                tab.push(nbcards);
            }

            return tab;
        },
        getQuantiteStatMountain() {
            var tab = [];
            for (let patate = 0; patate <= 10; patate++) {
                var nbcards = 0;
                this.currentDeck.cards.forEach(card => {
                    if (this.g_isPersonnage(card) && 
                        (card.mountainPower == patate || (patate == 10 && card.mountainPower > 10))) nbcards += card.quantite;
                });
                tab.push(nbcards);
            }

            return tab;
        },
        getQuantiteStatWater() {
            var tab = [];
            for (let patate = 0; patate <= 10; patate++) {
                var nbcards = 0;
                this.currentDeck.cards.forEach(card => {
                    if (this.g_isPersonnage(card) && 
                        (card.oceanPower == patate || (patate == 10 && card.oceanPower > 10))) nbcards += card.quantite;
                });
                tab.push(nbcards);
            }

            return tab;
        },
        getStatTotalForest()
        {
            var total = 0;
            this.currentDeck.cards.forEach(card => 
            {
                if (this.g_isPersonnage(card)) total += card.forestPower;
            });
            return total;
        },
        getStatTotalMountain()
        {
            var total = 0;
            this.currentDeck.cards.forEach(card => 
            {
                if (this.g_isPersonnage(card)) total += card.mountainPower;
            });
            return total;
        },
        getStatTotalOcean()
        {
            var total = 0;
            this.currentDeck.cards.forEach(card => 
            {
                if (this.g_isPersonnage(card)) total += card.oceanPower;
            });
            return total;
        }
    }
}
</script>