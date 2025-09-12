<script lang="ts">
    import { t } from '$lib/util.localization';
	import IconBluesky from "$lib/icons/link/bluesky.svelte";
	import IconDiscord from "$lib/icons/link/discord.svelte";
	import IconDriveThruRpg from "$lib/icons/link/dtrpg.svelte";
	import IconGitHub from "$lib/icons/link/github.svelte";
	import IconInstagram from "$lib/icons/link/instagram.svelte";
	import IconItch from "$lib/icons/link/itch.svelte";
	import IconMastodon from "$lib/icons/link/mastodon.svelte";
	import IconParadiso from "$lib/icons/link/paradiso.svelte";
	import IconReddit from "$lib/icons/link/reddit.svelte";
	import IconTikTok from "$lib/icons/link/tiktok.svelte";
	import IconTraaash from "$lib/icons/link/traaash.svelte";
	import IconTumblr from "$lib/icons/link/tumblr.svelte";
	import IconYouTube from "$lib/icons/link/youtube.svelte";
    import IconParadisoWorks from '$lib/icons/link/paradisoworks.svelte';
	import { help } from '$lib/util.help';
</script>

<div class="menu" id="about">
    <div>
        <h2>{$t('ui.menu.about.follow.title')}</h2>

        <p class="links">
            {$t('ui.menu.about.follow.web')}:
            <a href="https://www.paradiso.zone" target="_blank"
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseover = {()=>{help($t('help.menu.about.follow.paradisoZone'))}}
                onmouseout  = {()=>{help()}}><IconParadiso/></a>
            <a href="https://www.traaa.sh" target="_blank" 
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseover = {()=>{help($t('help.menu.about.follow.traaash'))}}
                onmouseout  = {()=>{help()}}><IconTraaash/></a>
            <a href="https://www.youtube.com/@ultraparadiso" target="_blank" 
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseover = {()=>{help($t('help.menu.about.follow.youtube'))}}
                onmouseout  = {()=>{help()}}><IconYouTube/></a>
            
            {$t('ui.menu.about.follow.shop')}:
            <a href="https://paradiso.works/" target="_blank" 
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseover = {()=>{help($t('help.menu.about.follow.paradisoWorks'))}}
                onmouseout  = {()=>{help()}}><IconParadisoWorks/></a>
            <a href="https://ultraparadiso.itch.io/" target="_blank" 
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseover = {()=>{help($t('help.menu.about.follow.itchio'))}}
                onmouseout  = {()=>{help()}}><IconItch/></a>
            <a href="https://www.drivethrurpg.com/browse/pub/23556/Paradiso" target="_blank" 
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseover = {()=>{help($t('help.menu.about.follow.dtrpg'))}}
                onmouseout  = {()=>{help()}}><IconDriveThruRpg/></a>
            
            {$t('ui.menu.about.follow.social')}:
            <a href="https://bsky.app/profile/traaa.sh" target="_blank" 
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseover = {()=>{help($t('help.menu.about.follow.bsky'))}}
                onmouseout  = {()=>{help()}}><IconBluesky/></a>
            <a href="https://www.instagram.com/quadratraaash/" target="_blank" 
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseover = {()=>{help($t('help.menu.about.follow.instagram'))}}
                onmouseout  = {()=>{help()}}><IconInstagram/></a>
            <a href="https://www.tiktok.com/@paradiso102" target="_blank" 
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseover = {()=>{help($t('help.menu.about.follow.tiktok'))}}
                onmouseout  = {()=>{help()}}><IconTikTok/></a>
            <a href="https://dice.camp/@quadra" target="_blank" 
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseover = {()=>{help($t('help.menu.about.follow.mastodon'))}}
                onmouseout  = {()=>{help()}}><IconMastodon/></a>
            <a href="https://www.tumblr.com/quadratrash" target="_blank" 
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseover = {()=>{help($t('help.menu.about.follow.tumblr'))}}
                onmouseout  = {()=>{help()}}><IconTumblr/></a>
            <a href="https://www.reddit.com/user/quadrazone/" target="_blank" 
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseover = {()=>{help($t('help.menu.about.follow.reddit'))}}
                onmouseout  = {()=>{help()}}><IconReddit/></a>
            <a href="https://github.com/quadraturin" target="_blank" 
                onfocus     = {()=>{}} 
                onblur      = {()=>{}}
                onmouseover = {()=>{help($t('help.menu.about.follow.github'))}}
                onmouseout  = {()=>{help()}}><IconGitHub/></a>

            <!--<a href="" target="_blank" title="Discord"><IconDiscord/></a>-->
        </p>

        <h2>{$t('ui.menu.about.about.title')}</h2>
        
        <p><em>{$t('ui.menu.about.about.version')} 0.5.0</em></p>
        
        <p>{@html $t('ui.menu.about.about.blurb')}</p>
        
        <p>{@html $t('ui.menu.about.about.credits')}</p>
        
        <p>{@html $t('ui.menu.about.about.video')}</p>

        <p><a href="https://youtu.be/LQraTyCoS4E" target="_blank">https://youtu.be/LQraTyCoS4E</a></p>

        <p>{@html $t('ui.menu.about.about.howToUse')}</p>

        <p>{@html $t('ui.menu.about.about.projectFiles')}</p>

        <h2>{$t('ui.menu.about.changelog.title')}</h2>

       

        <h2>{$t('ui.menu.about.licenses.title')}</h2>

        <p>{@html $t('ui.menu.about.licenses.blurb')}</p>

<h3>tauri</h3>
<pre>MIT License

Copyright (c) 2020-2022 Tauri Programme within the Commons Conservancy

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>

<h3>sveltekit</h3>
<pre>MIT License
    
Copyright (c) 2020 <a href="https://github.com/sveltejs/kit/graphs/contributors" target="_blank">these people</a>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>

<h3>svelte</h3>
<pre>MIT License
    
Copyright (c) 2016-23 <a href="https://github.com/sveltejs/svelte/graphs/contributors" target="_blank">these people</a>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>

<h3>vite</h3>
<pre>MIT License

Copyright (c) 2019-present, Yuxi (Evan) You and Vite contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>

<h3>sveltekit-i18n</h3>
<pre>MIT License

Copyright (c) 2022 sveltekit-i18n

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>

<h3>definitely typed typescript definitions</h3>
<pre>MIT License

Copyright (c) Microsoft Corporation.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE</pre>

<h3>tabler icons</h3>

<pre>MIT License

Copyright (c) 2020-2023 Paweł Kuna

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.</pre>
    </div>
</div>
