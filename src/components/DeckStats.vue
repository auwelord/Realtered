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
                            label: this.$t('ui.lib.maincost'),
                            data: this.getQuantiteMainCost(),
                            borderColor: "white",
                            backgroundColor: this.g_getFactionColorFromDeck(this.currentDeck),
                        },
                        {
                            label: this.$t('ui.lib.recallcost'),
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
                                text: this.$t('ui.lib.manacost'),
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: this.$t('ui.lib.nbcartes'),
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: this.$t('ui.lib.couts'),
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
                    labels: [this.$t('ui.lib.couttotal')],
                    datasets: [
                        {
                            label: this.$t('ui.lib.totalmaincost'),
                            data: [this.getCoutTotalMain()],
                            borderColor: "white",
                            backgroundColor: this.g_getFactionColorFromDeck(this.currentDeck),
                        },
                        {
                            label: this.$t('ui.lib.totalrecallcost'),
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
                                text: this.$t('ui.lib.manacost'),
                            }
                        },
                        y: {
                            display: false                            
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: this.$t('ui.lib.couts'),
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
                    labels: [this.$t('ui.lib.personnage'), this.$t('ui.lib.sort'), this.$t('ui.lib.permanent')],
                    datasets: [
                        {
                            label: this.$t('ui.lib.nbcartes'),
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
                            text: this.$t('ui.lib.repartitionpartype')
                        }
                    }
                }
            },
            chartTotalStat: {
                chartData: {
                    labels: [""],
                    datasets: [
                        {
                            label: this.$t('ui.lib.totalforestpower'),
                            data: [this.getStatTotalForest()],
                            borderColor: "white",
                            backgroundColor: this.g_colorForest(),
                        },
                        {
                            label: this.$t('ui.lib.totalmountainpower'),
                            data: [this.getStatTotalMountain()],
                            borderColor: "white",
                            backgroundColor: this.g_colorMountain(),
                        }
                        ,
                        {
                            label: this.$t('ui.lib.totaloceanpower'),
                            data: [this.getStatTotalOcean()],
                            borderColor: "white",
                            backgroundColor: this.g_colorWater(),
                        }
                    ]
                },
                chartOptions: {
                    responsive: true,
                    indexAxis: 'y',
                    plugins: {
                        title: {
                            display: true,
                            text: this.$t('ui.lib.totalbiomepower'),
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
                            label: this.$t('ui.lib.foret'),
                            data: this.getQuantiteStatForet(),
                            borderColor: "white",
                            backgroundColor: this.g_colorForest(),
                        },
                        {
                            label: this.$t('ui.lib.montagne'),
                            data: this.getQuantiteStatMountain(),
                            borderColor: "white",
                            backgroundColor: this.g_colorMountain(),
                        }
                        ,
                        {
                            label: this.$t('ui.lib.ocean'),
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
                                text: this.$t('ui.lib.patates'),
                            }
                        },
                        y: {
                            display: true,
                            title: {
                                display: true,
                                text: this.$t('ui.lib.nbcartes'),
                            }
                        }
                    },
                    plugins: {
                        title: {
                            display: true,
                            text: this.$t('ui.lib.biomepower'),
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
            this.currentDeck.cards.forEach(card => 
            {
                if (!this.g_isHero(card)) cout += (card.mainCost * card.quantite);
            });
            return cout;
        },
        getCoutTotalReserve(){
            var cout = 0;
            this.currentDeck.cards.forEach(card => 
            {
                if (!this.g_isHero(card)) cout += (card.recallCost * card.quantite);
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
                if (this.g_isPersonnage(card)) total += (card.forestPower * card.quantite);
            });
            return total;
        },
        getStatTotalMountain()
        {
            var total = 0;
            this.currentDeck.cards.forEach(card => 
            {
                if (this.g_isPersonnage(card)) total += (card.mountainPower * card.quantite);
            });
            return total;
        },
        getStatTotalOcean()
        {
            var total = 0;
            this.currentDeck.cards.forEach(card => 
            {
                if (this.g_isPersonnage(card)) total += (card.oceanPower * card.quantite);
            });
            return total;
        }
    }
}
</script>