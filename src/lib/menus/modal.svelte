<script>
    import { t } from '$lib/util.localization';
	import { closeModal } from '$lib/ui.modals';
	import { getImagesToDelete, getSoundsToDelete, setImagesToDelete, setSoundsToDelete } from '$lib/registry.svelte';
	import { removeObject } from '$lib/media.remove';
</script>

<div id="modal-background">
    <div id="modal">
        <div id="modal-title">-</div>
        <div id="modal-body"></div>
        <div id="modal-actions">
            <button id='modal-cancel' onclick="{closeModal}">
                {$t('ui.menu.modal.cancel')}
            </button>
            <button id='modal-confirm' onclick="{closeModal}">
                {$t('ui.menu.modal.confirm')}
            </button>
            <button id='modal-deleteunique-confirm' onclick="{()=>{
                getSoundsToDelete().forEach(obj => { removeObject(obj) });
                getImagesToDelete().forEach(obj => { removeObject(obj) });
                setImagesToDelete([]);
                setSoundsToDelete([]);
                closeModal();
            }}">
                {$t('ui.menu.modal.deleteUnique.confirm')}
            </button>
        </div>
    </div>
</div>
