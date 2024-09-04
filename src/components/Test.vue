<template>
     <BButton @click="downloadImages" variant="unique" size="sm" v-if="cards">Download images</BButton>
     <BButton @click="updateImagePath" variant="primary" size="sm">Mise à jour des chemins images</BButton>
</template>

<script>
export default {
    data() {
        return {
            cards: null
        };
    },
    methods: {
        updateImagePath(){
            this.cards.forEach(card => {
                var path = "cards/";
                if(card.mainFaction == "AX") path+= "axiom/";
                else if(card.mainFaction == "BR") path+= "bravos/";
                else if(card.mainFaction == "LY") path+= "lyra/";
                else if(card.mainFaction == "MU") path+= "muna/";
                else if(card.mainFaction == "OR") path+= "ordis/";
                else path+= "yzmir/";

                path+= card.reference + '.webp';

                console.log(path);
                $.extend(card, {imageS3: path});
            });

            this.g_updateAllCards(this.cards, null);
        },
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        downloadBlob(url, filename) {
            fetch(`http://localhost:3000/proxy?url=${encodeURIComponent(url)}`)
                .then(response => response.blob())
                .then(blob => {
                    const blobUrl = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = blobUrl;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(blobUrl);
                })
                .catch(error => console.error('Error downloading image:', error));
        },

        async downloadImages()
        {
            console.log("Downloading " + this.cards.length + " images");

            for(let card of this.cards)
            {
                this.downloadBlob(card.imagePath, card.reference + ".jpg");
                await this.sleep(500);
            }
        }
    },
    mounted() {
        //downloadimages this.g_fetchFactionCards("YZ", pcards => this.cards = pcards);
        this.g_fetchFactionCards("", pcards => this.cards = pcards);
    }
};
</script>