<template>
    <Deckselect :typeui="'decktest'" :user="user" />
</template>

<script setup>
const props = defineProps({
    user: { type: Object },
});
</script>