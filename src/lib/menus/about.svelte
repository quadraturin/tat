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
	import { marked, type Tokens } from "marked";

    // modified https://github.com/markedjs/marked/issues/655#issuecomment-712380889
    const renderer = {
    link({ href, title, text }: Tokens.Link): string {
        const localLink = href.startsWith(
        `${location.protocol}//${location.hostname}`
        );

        // to avoid title="null"
        if (title === null) {
        return localLink
            ? `<a href="${href}">${text}</a>`
            : `<a target="_blank" rel="noreferrer noopener" href="${href}">${text}</a>`;
        }
        return localLink
        ? `<a href="${href}" title="${title}">${text}</a>`
        : `<a target="_blank" rel="noreferrer noopener" href="${href}" title="${title}">${text}</a>`;
    },
    };

    marked.use({ renderer });
    
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
        
        {@html marked.parse($t('ui.menu.about.about.blurb'))}
        
        {@html marked.parse($t('ui.menu.about.about.credits'))}
        
        {@html marked.parse($t('ui.menu.about.about.video'))}

        <p><a href="https://youtu.be/LQraTyCoS4E" target="_blank">https://youtu.be/LQraTyCoS4E</a></p>

        {@html marked.parse($t('ui.menu.about.about.howToUse'))}

        {@html marked.parse($t('ui.menu.about.about.projectFiles'))}

        <h2>{$t('ui.menu.about.changelog.title')}</h2>

        {@html marked.parse($t('ui.menu.about.changelog.changelog'))}

        <h2>{$t('ui.menu.about.licenses.title')}</h2>

        <p>{@html $t('ui.menu.about.licenses.blurb')}</p>

<h3>Tauri</h3>
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

<h3>Sveltekit</h3>
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

<h3>Svelte</h3>
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

<h3>Vite</h3>
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

<h3>Marked</h3>

<pre>Copyright (c) 2018+, MarkedJS (<a href="https://github.com/markedjs/" target="_blank">https://github.com/markedjs/</a> Copyright (c) 
2011-2018, Christopher Jeffrey (<a href="https://github.com/chjj/" target="_blank">https://github.com/chjj/</a>)

Permission is hereby granted, free of charge, to any person obtaining a copy 
of this software and associated documentation files (the "Software"), to deal 
in the Software without restriction, including without limitation the rights to 
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of 
the Software, and to permit persons to whom the Software is furnished to do so, 
subject to the following conditions:

- The above copyright notice and this permission notice shall be included in all 
  copies or substantial portions of the Software.

- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR 
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE 
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, 
  WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN 
  CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</pre>

<h3>Markdown</h3>

<pre>Copyright © 2004, John Gruber <a href="http://daringfireball.net/" target="_blank">http://daringfireball.net/</a> All rights reserved.

Redistribution and use in source and binary forms, with or without modification, 
are permitted provided that the following conditions are met:

- Redistributions of source code must retain the above copyright notice, this 
  list of conditions and the following disclaimer.
- Redistributions in binary form must reproduce the above copyright notice, 
  this list of conditions and the following disclaimer in the documentation and/or 
  other materials provided with the distribution.
- Neither the name “Markdown” nor the names of its contributors may be used to 
  endorse or promote products derived from this software without specific prior 
  written permission.

This software is provided by the copyright holders and contributors “as is” and 
any express or implied warranties, including, but not limited to, the implied 
warranties of merchantability and fitness for a particular purpose are disclaimed.
In no event shall the copyright owner or contributors be liable for any direct, 
indirect, incidental, special, exemplary, or consequential damages (including, but 
not limited to, procurement of substitute goods or services; loss of use, data, or 
profits; or business interruption) however caused and on any theory of liability, 
whether in contract, strict liability, or tort (including negligence or otherwise) 
arising in any way out of the use of this software, even if advised of the 
possibility of such damage.</pre>

<h3>Definitely Typed Typescript Definitions</h3>
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

<h3>Tabler Icons</h3>

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
