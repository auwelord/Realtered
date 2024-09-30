<template>
    <Deckselect :typeui="'decklist'" :user="user" />
</template>

<script setup>
const props = defineProps({
    user: { type: Object },
});
</script>