<script>
    import { t } from '$lib/util.localization';
	import IconLoading from "$lib/icons/iconLoading.svelte";
</script>
<div id="modal-background">
    <div id="modal">
        <h2><IconLoading /> <span id="modal-title">{$t('ui.loading')}</span></h2>
        <ul id="modal-text"></ul>
    </div>
</div>
