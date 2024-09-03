<template>
     <BButton @click="downloadImages" variant="unique" size="sm" v-if="cards">Download</BButton>
</template>

<script>
export default {
    data() {
        return {
            cards: null
        };
    },
    methods: {
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
        this.g_fetchFactionCards("YZ", pcards => this.cards = pcards);
    }
};
</script>