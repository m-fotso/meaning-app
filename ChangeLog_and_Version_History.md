Change Log and Version History (Github Log): 

FINAL DELIVERABLE 7 VERSION (any changes after this are minor bug fixes)
commit 31931d7e6663134f6b218f57c4ec9b0c0a1e2ccd (HEAD -> main, origin/main, origin/HEAD)
Merge: 6f7aa72 72ef627
Author: Leo Rosales <leorosal@usc.edu>
Date:   Sun May 3 03:17:35 2026 -0700

    Merge pull request #17 from m-fotso/leo-branch
    
    Add TTS server setup instructions to README

commit 72ef627cd1624054861dda340bb723e2808fd2b5 (origin/leo-branch)
Author: Leow210 <leorosal@usc.edu>
Date:   Sun May 3 02:37:40 2026 -0700

    Add TTS server setup instructions to README

commit 6f7aa723635883f6961067e763572068006b61c9
Merge: 92974c6 bfbbca0
Author: Anchal Srivastava <anchalsr@usc.edu>
Date:   Sun Apr 19 22:37:15 2026 -0700

    Merge pull request #16 from m-fotso/ImageGenFeatureUpdated
    
    Image gen feature updated

commit bfbbca0c46244dcf922d046307037261a354fd5a (origin/ImageGenFeatureUpdated)
Author: anchals7 <anchalsr@usc.edu>
Date:   Sun Apr 19 22:25:55 2026 -0700

    Integrated proper response handling with merge resolutions

commit ca23ae4fec73db3c1cdfed73e7cf789754850623
Merge: 92974c6 9f463f4
Author: Anchal Srivastava <anchalsr@usc.edu>
Date:   Sun Apr 19 22:04:03 2026 -0700

    Merge branch 'ImageGenerationFeature' into ImageGenFeatureUpdated

commit 9f463f4da71f2043642b955b6dd8e90ceca2220d
Author: anchals7 <anchalsr@usc.edu>
Date:   Sun Apr 19 21:47:07 2026 -0700

    Revert "Updated to fix merge conflicts"
    
    This reverts commit 2dcce4a6e31bb65b56b0ec631fdd7d8757a7cdf1.

commit 6c4bff603aadc9972de4388df42e80a2b10cf20c
Author: anchals7 <anchalsr@usc.edu>
Date:   Sun Apr 19 21:47:00 2026 -0700

    Revert "Update merge fixes"
    
    This reverts commit ce0c40071f79f8600d7b3d9d6a48cf46592d5a30.

commit ce0c40071f79f8600d7b3d9d6a48cf46592d5a30
Author: anchals7 <anchalsr@usc.edu>
Date:   Sun Apr 19 21:44:33 2026 -0700

    Update merge fixes

commit 2dcce4a6e31bb65b56b0ec631fdd7d8757a7cdf1
Author: anchals7 <anchalsr@usc.edu>
Date:   Sun Apr 19 21:35:40 2026 -0700

    Updated to fix merge conflicts

commit 43e7fbb6deba0e873256a4fada559f560cea7c95
Author: anchals7 <anchalsr@usc.edu>
Date:   Sun Apr 19 21:28:19 2026 -0700

    Added implementation for Image Generation w/ API
    
    - Includes fallback for API failures

commit 92974c61bcae35f910f2a44e63ed765e8fcb9b96
Merge: 7a3ea4d 7eba0c4
Author: Leo Rosales <leorosal@usc.edu>
Date:   Sun Apr 19 20:52:40 2026 -0700

    Merge pull request #11 from m-fotso/leo-branch
    
    Add TTS with Azure premium voices, voice selection, and playback UI

commit 7eba0c4752e523c372b9e7c89d4707c0dfd2bdf7
Author: Leow210 <leorosal@usc.edu>
Date:   Sun Apr 19 20:51:11 2026 -0700

    Remove unnecessary readme file

commit 247f675e42c5bb22dc62a09ff6be9ceb5a39a417
Merge: ff7cbe5 7a3ea4d
Author: Leow210 <leorosal@usc.edu>
Date:   Sun Apr 19 20:39:15 2026 -0700

    Merge main into leo-branch with TTS features

commit 7a3ea4d54ef7bbdccf5db01617f98c2cdd0ec97d
Merge: 356ede2 cbf29be
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Wed Apr 15 18:09:17 2026 -0700

    Merge pull request #9 from m-fotso/john-deliverable-5
    
    generate 10 images per book

commit 90b2b717e15f1a55aef894e74cfeedafb910a267 (origin/Deliverable5-Anchal)
Author: anchals7 <anchalsr@usc.edu>
Date:   Sun Apr 5 23:44:11 2026 -0700

    Added block for placeholder images and placeholder image generation

commit 356ede25d2b549f732fef2ddb0088a6afb4d943f
Merge: bfadee0 00574fb
Author: Roselyn Chin <69706357+RoselynChin@users.noreply.github.com>
Date:   Sun Apr 5 22:17:03 2026 -0700

    Merge pull request #10 from m-fotso/deliverable5-roselyn
    
    updated so now if a new chapter is entered, the ChapterNote modal pop…

commit 00574fbbe879bd7f0e928c3f697734601346e8fe (origin/deliverable5-roselyn, del
iverable5-roselyn)
Author: Roselyn Chin <roseychin5@gmail.com>
Date:   Sun Apr 5 22:16:20 2026 -0700

    updated so now if a new chapter is entered, the ChapterNote modal pops up to 
prompt users to make notes on the previous content

commit cbf29beb7290f51ace4af12c5b71dd3311a657ca (origin/john-deliverable-5)
Author: John Michaels <johnm671@usc.edu>
Date:   Mon Apr 6 01:11:20 2026 -0400

    image updates

commit ff7cbe51886a2e35190da0a96944338f18aaa0bc
Merge: bb70666 bfadee0
Author: Leow210 <leorosal@usc.edu>
Date:   Sun Apr 5 20:59:29 2026 -0700

    Merge main and upgrade TTS with Azure premium voices, voice selection, and pl
ayback UI
    
    Pulled latest changes from main (auth, book service, notes, highlights, reade
r
    improvements) and resolved merge conflicts in book/[id].tsx, package.json, an
d
    server/index.js.
    
    Added Azure Speech Services as a premium TTS engine alongside the existing Pi
per
    engine. Users can now choose between Standard (Piper) and Premium (Azure) wit
h
    selectable voices for each — Piper auto-detects installed models from disk, A
zure
    offers HD multilingual voices (Ava, Andrew, Emma, Brian) at 48kHz output.
    
    Rebuilt the TTS player UI with a progress bar, play/pause, seek, and time dis
play.
    Voice, speed, and engine settings are changeable while paused and the player
    automatically regenerates audio when settings differ from what's currently lo
aded
    instead of replaying stale cached audio.
    
    Fixed the caching bug where changing voice or engine would still serve the ol
d
    audio file by adding voiceId to the cache key in Firestore queries, storage p
aths,
    and metadata documents.
    
    Added server-side text preprocessing that cleans up mid-sentence line breaks 
from
    PDF parsing (single newlines become spaces, paragraph breaks preserved, broke
n
    hyphenation fixed) so TTS output sounds natural without modifying the parser.
    
    Azure credentials are loaded from server/.env (added to .gitignore).

commit bfadee0e96f018a9061c08d4fe2d465fe2bd9d1d
Merge: 4c19d26 5ae55c0
Author: Marie Fotso <fotso@usc.edu>
Date:   Tue Mar 31 21:07:26 2026 -0700

    Merge pull request #8 from m-fotso/deliverable-5-marie
    
    commented out openai for proper main

commit 5ae55c03bedd153a473d610c5e2255b4390f3df4 (origin/backend-api-adjustment)
Author: m-fotso <fotso@usc.edu>
Date:   Tue Mar 31 21:04:25 2026 -0800

    commented out openai for proper main

commit 4c19d264544ce7c4c2dd08d3188a6357323a0df3
Merge: 4e7efbe 2dbf739
Author: m-fotso <fotso@usc.edu>
Date:   Mon Mar 9 10:49:05 2026 -0800

    Merge branch 'main' of https://github.com/m-fotso/meaning-app

commit 4e7efbe7fa821d5ad00d65f552a65179d77044ac (origin/deliverable-4-ai)
Author: m-fotso <fotso@usc.edu>
Date:   Mon Mar 9 10:29:31 2026 -0800

    removed duplicate lines

commit a7e679fcb818fb25187b201c52ebd26f62c86770
Merge: 761472c 8d1563f
Author: m-fotso <fotso@usc.edu>
Date:   Mon Mar 9 10:26:15 2026 -0800

    Merge branch 'deliverable-2-parsing' of https://github.com/m-fotso/meaning-ap
p into deliverable-4-ai

commit 761472c082167388746d82d6ac8df54a586cece3
Author: m-fotso <fotso@usc.edu>
Date:   Mon Mar 9 10:11:58 2026 -0800

    added chapter notation and keeping up to date

commit 2dbf7391255960f2434050406e7aeee430093830
Author: Leo Rosales <leorosal@usc.edu>
Date:   Sun Mar 8 00:01:14 2026 -0800

    Delete local directory

commit 4332a68a33d1632ca166f0231c94037aca77e939
Merge: 60b3886 482c166
Author: Leo Rosales <leorosal@usc.edu>
Date:   Sat Mar 7 23:59:58 2026 -0800

    Merge pull request #7 from m-fotso/feat/book-firestore
    
    Merge Feat/book firestore

commit 482c166867962e683124159fe290fb5bac842535 (origin/feat/book-firestore)
Author: Leow210 <leorosal@usc.edu>
Date:   Sat Mar 7 23:52:53 2026 -0800

    feat: merge main, add changes summary, fix indentation in book detail

commit 0e994db7ef62c8fb3b071dfb202cf02abcdc51a0
Merge: 9f32472 60b3886
Author: Leow210 <leorosal@usc.edu>
Date:   Sat Mar 7 23:22:38 2026 -0800

    Merge remote-tracking branch 'origin/main' into feat/book-firestore
    
    # Conflicts:
    #       meaning/app/book/[id].tsx

commit 8d1563f314b9d0846c175470a49155071d2d9eba (origin/deliverable-2-parsing)
Merge: f06b498 3d49075
Author: m-fotso <fotso@usc.edu>
Date:   Sat Mar 7 12:28:55 2026 -0800

    Merge branch 'deliverable-2-parsing' of https://github.com/m-fotso/meaning-ap
p into deliverable-2-parsing

commit f06b498020c51e5300c24e06f2ecb8fabe30048d
Author: m-fotso <fotso@usc.edu>
Date:   Sat Mar 7 12:27:08 2026 -0800

    please work

commit d6c0a04d6812014975a50e041cc3405689cd6edf
Author: m-fotso <fotso@usc.edu>
Date:   Sat Mar 7 12:24:04 2026 -0800

    added chapter tracing

commit 1e4107fcf5c5df8c3b3313757082e20981105828
Merge: 23b8294 87141b8
Author: m-fotso <fotso@usc.edu>
Date:   Sat Mar 7 12:23:29 2026 -0800

    Merge branch 'main' of https://github.com/m-fotso/meaning-app into deliverabl
e-2-parsing

commit 23b8294d9466926588b8a720eee3203fcfeda2b1
Author: m-fotso <fotso@usc.edu>
Date:   Sat Mar 7 12:12:03 2026 -0800

    added chapter tracking

commit 60b3886f4b20070a2eedd21a9ca802685dd99378
Merge: 8a5e080 48a61c5
Author: Roselyn Chin <69706357+RoselynChin@users.noreply.github.com>
Date:   Fri Mar 6 02:12:10 2026 -0800

    Merge pull request #5 from m-fotso/deliverable3-roselyn
    
    update annotations menu and chapter note component

commit 87141b8f4f17154c8869b7f7c64a8a49e65258d4
Merge: 298396e 12b8455
Author: Roselyn Chin <69706357+RoselynChin@users.noreply.github.com>
Date:   Fri Mar 6 02:12:10 2026 -0800

    Merge pull request #5 from m-fotso/deliverable3-roselyn
    
    update annotations menu and chapter note component

commit 48a61c5258d1536b9934fd17e348c7ab9b630f46 (origin/deliverable3-roselyn, del
iverable3-roselyn)
Author: Roselyn Chin <roseychin5@gmail.com>
Date:   Fri Mar 6 02:09:19 2026 -0800

    added chapter note modal and fixed annotation menus, should be good to move o
n

commit 12b84554373d196ed77a7c3112619c96765c859b
Author: Roselyn Chin <roseychin5@gmail.com>
Date:   Fri Mar 6 02:09:19 2026 -0800

    added chapter note modal and fixed annotation menus, should be good to move o
n

commit c099fe0621618cc5d24d3d3d7d75e6485c812e00
Merge: b6b7c38 8a5e080
Author: Roselyn Chin <roseychin5@gmail.com>
Date:   Fri Mar 6 01:41:50 2026 -0800

    manuallly merge json

commit 122aa5fc31ad128b1e0f2771ce5f53d8f6b04b17
Merge: 2792c35 298396e
Author: Roselyn Chin <roseychin5@gmail.com>
Date:   Fri Mar 6 01:41:50 2026 -0800

    manuallly merge json

commit 9f3247295284842d3bd57e89f736ea6d3979ab1c
Author: Leow210 <leorosal@usc.edu>
Date:   Wed Mar 4 18:41:01 2026 -0800

    feat: add Firebase books subcollection for reading progress

commit 3d49075e05928ecf3594f49e665b8377ea65a486
Merge: 034fe54 298396e
Author: m-fotso <fotso@usc.edu>
Date:   Thu Feb 26 15:10:13 2026 -0800

    more cleaning

commit 034fe545d0e234d55774784f124f4e6a1d7b35c0
Author: m-fotso <fotso@usc.edu>
Date:   Thu Feb 26 15:06:12 2026 -0800

    updating my side

commit bb7066646d3f45159826809483c7f4d402bb424e
Author: Leow210 <leorosal@usc.edu>
Date:   Mon Feb 23 00:20:26 2026 -0800

    feat: add text-to-speech with Piper TTS and Firebase caching
    
    Add TTS to the book reader using Piper TTS (fast local neural voice).
    Users tap Listen to hear a page read aloud, with audio cached in
    Firebase Storage so repeat listens are instant. Also fix PDF parsing
    for Node 20.11 (downgrade pdf-parse to v1) and add fallback page
    splitting for PDFs without page markers.

commit 298396eb4dc9458caf44c6fcf69bc7485b9baab3
Merge: 47bed14 eace796
Author: Anchal Srivastava <anchalsr@usc.edu>
Date:   Sun Feb 22 22:44:25 2026 -0800

    Merge pull request #4 from m-fotso/deliverable-3-anchal
    
    feat(book): Highlight, popup actions, and search for PDF text - deliverable-3
-anchal

commit 8a5e080fea8a63758b8b5c7ae38a3dcce55f94f4
Merge: f41d4f6 fc74d66
Author: Anchal Srivastava <anchalsr@usc.edu>
Date:   Sun Feb 22 22:44:25 2026 -0800

    Merge pull request #4 from m-fotso/deliverable-3-anchal
    
    feat(book): Highlight, popup actions, and search for PDF text - deliverable-3
-anchal

commit eace796d53368c4c9c49b22a3c2a9d72b5ba6b74
Author: anchals7 <anchalsr@usc.edu>
Date:   Sun Feb 22 22:42:53 2026 -0800

    feat(book): add text highlight, popup actions, and search (YouTube/Google)
    
    - Add range-based highlights: only the exact selected text is highlighted (no
 full-line).
    - Popup on phrase: right-click (web) or long-press (mobile) opens Highlight /
 Copy / Search.
    - Web: text is selectable; "Interact" button in bottom bar opens popup with l
ast selection.
    - Clicking a highlighted span opens popup with Unhighlight option.
    - Search opens modal with YouTube and Google links for the phrase.
    - Annotations panel lists highlights per page with Search and tap-to-unhighli
ght.
    - Platform-specific hint text under PDF content.
    - Depends on expo-clipboard; see HIGHLIGHT_AND_SEARCH_FEATURE.md for details.

commit fc74d663dd7e701a08b6f8637b65d86e43b7d1b5 (origin/deliverable-3-anchal)
Author: anchals7 <anchalsr@usc.edu>
Date:   Sun Feb 22 22:42:53 2026 -0800

    feat(book): add text highlight, popup actions, and search (YouTube/Google)
    
    - Add range-based highlights: only the exact selected text is highlighted (no
 full-line).
    - Popup on phrase: right-click (web) or long-press (mobile) opens Highlight /
 Copy / Search.
    - Web: text is selectable; "Interact" button in bottom bar opens popup with l
ast selection.
    - Clicking a highlighted span opens popup with Unhighlight option.
    - Search opens modal with YouTube and Google links for the phrase.
    - Annotations panel lists highlights per page with Search and tap-to-unhighli
ght.
    - Platform-specific hint text under PDF content.
    - Depends on expo-clipboard; see HIGHLIGHT_AND_SEARCH_FEATURE.md for details.

commit 30de4be22fc48e57f41e89fa853ef84ad8159611
Merge: 2a6ac48 47bed14
Author: Anchal Srivastava <anchalsr@usc.edu>
Date:   Sun Feb 22 22:29:57 2026 -0800

    Merge pull request #3 from m-fotso/main
    
    Updating current branch

commit 51db2dd1067338c596a0ac237aadc429f86375bf
Merge: c68ce24 f41d4f6
Author: Anchal Srivastava <anchalsr@usc.edu>
Date:   Sun Feb 22 22:29:57 2026 -0800

    Merge pull request #3 from m-fotso/main
    
    Updating current branch

commit 47bed149c0bf74ffac252c1b3bcbe21f03e9c2e4
Merge: 2a6ac48 6e6ac37
Author: Leo Rosales <leorosal@usc.edu>
Date:   Sun Feb 22 22:08:44 2026 -0800

    Merge pull request #2 from m-fotso/leo-branch
    
    Leo branch

commit f41d4f60beea6b71bd92b8a0e1418a68da7f1d21
Merge: c68ce24 87c0e71
Author: Leo Rosales <leorosal@usc.edu>
Date:   Sun Feb 22 22:08:44 2026 -0800

    Merge pull request #2 from m-fotso/leo-branch
    
    Leo branch

commit 6e6ac3731a13fb56cafc515939b98944461e692f
Merge: 7d6f644 2a6ac48
Author: Leow210 <leorosal@usc.edu>
Date:   Sun Feb 22 22:06:42 2026 -0800

    merging user login and signup functionality to main

commit 87c0e71d8441b0ef0f8e8ff5e760a1fa0ccd3105
Merge: effa5f5 c68ce24
Author: Leow210 <leorosal@usc.edu>
Date:   Sun Feb 22 22:06:42 2026 -0800

    merging user login and signup functionality to main

commit 2a6ac48e9877fc8c544f29dca5652a578042c3c3
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Sun Feb 22 12:01:57 2026 -0800

    annotations

commit c68ce24f9c48012d8c4a419092f9cb03fb6d441a (origin/john)
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Sun Feb 22 12:01:57 2026 -0800

    annotations

commit cddc3ec7314a1c278dfff0bdb0bb90d7bf48b62e
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Sun Feb 22 10:42:40 2026 -0800

    readme updates

commit fa57bfc7e2eded442ae72b0a30231040586abc24
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Sun Feb 22 10:42:40 2026 -0800

    readme updates

commit 54a4affdcfb009bf78cf7952af69d9bd528438fb
Merge: 1dd3c9d 9974c00
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Sun Feb 22 10:02:15 2026 -0800

    Merge remote-tracking branch 'origin/main' into john

commit 57fc9c8171ac8f4f8d9aba64e4df09fbe2579fc1
Merge: 9a56587 000a496
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Sun Feb 22 10:02:15 2026 -0800

    Merge remote-tracking branch 'origin/main' into john

commit 1dd3c9d766c7c2874eaa7b2e0659bd299336a60a
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Sun Feb 22 09:53:38 2026 -0800

    Ignore node_modules

commit 9a56587f9c3a6624903e45bcd920747a5c04e054
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Sun Feb 22 09:53:38 2026 -0800

    Ignore node_modules

commit 9974c006d55426a2eab997067ce00eedd0c91ce3
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Sun Feb 22 09:20:55 2026 -0800

    small changes

commit 000a4963631615fd7bcff6cd69ae44a17a257e61
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Sun Feb 22 09:20:55 2026 -0800

    small changes

commit b6b7c38bf019ac142572c25dc9d775944b0df839
Merge: 7bb5337 2619e5e
Author: Roselyn Chin <roseychin5@gmail.com>
Date:   Sun Feb 22 00:35:40 2026 -0800

    create another branch from main to add in annotation menu + firebase, will tr
y to integrate parsing parts too

commit 2792c35c5cf8c78cc3d717faf80625381cc6f716
Merge: 4b91b66 7929a58
Author: Roselyn Chin <roseychin5@gmail.com>
Date:   Sun Feb 22 00:35:40 2026 -0800

    create another branch from main to add in annotation menu + firebase, will tr
y to integrate parsing parts too

commit 2619e5ee14bddf3f0134aa8b58dbd5a0de65f3e9 (origin/deliverable2-roselyn, del
iverable2-roselyn)
Author: Roselyn Chin <roseychin5@gmail.com>
Date:   Sat Feb 21 22:16:36 2026 -0800

    created reader page with annotation menu

commit 7929a5897061468aae2f27130cb4846a5d2b70b3
Author: Roselyn Chin <roseychin5@gmail.com>
Date:   Sat Feb 21 22:16:36 2026 -0800

    created reader page with annotation menu

commit 4723f742d786fda487606dc564b9f86c5b041156
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Wed Feb 11 18:23:32 2026 -0800

    parse-pdf.js

commit 6e797a400c31a9adf7e498884000cd73f01b5870
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Wed Feb 11 18:23:32 2026 -0800

    parse-pdf.js

commit 614819e6f4eb0636c58393f987cda7848af499e0
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Wed Feb 11 17:55:26 2026 -0800

    john's additons

commit 4ed10bd03592a2b0b26e47bfc5bc3cd67866462e (john)
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Wed Feb 11 17:55:26 2026 -0800

    john's additons

commit 7d3e1ba21e60b432dcadb4198591afff249834d3
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Wed Feb 11 17:39:50 2026 -0800

    parsing basic

commit 582eac54a5163b9e5306a318b0a95a1b27eaf544
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Wed Feb 11 17:39:50 2026 -0800

    parsing basic

commit bf5fc67163e60492b4e37d093f199c3327d311ec
Author: m-fotso <fotso@usc.edu>
Date:   Sun Feb 8 22:32:33 2026 -0800

    change parsing to api call

commit 220829907a8a7545c7ae99a841852a73f643b22a
Merge: 4b91b66 9a67a0c
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Sun Feb 8 21:25:39 2026 -0800

    XXMerge branch 'deliverable-2-parsing' into john

commit 1886aebba9d7e83cb114bcb21a0c74b3d369d6df
Merge: 7bb5337 cffc946
Author: johnmikes100 <112113265+johnmikes100@users.noreply.github.com>
Date:   Sun Feb 8 21:25:39 2026 -0800

    XXMerge branch 'deliverable-2-parsing' into john

commit 9a67a0c85f5d9358f78ad2c1cbb6494e0bf8f603
Author: m-fotso <fotso@usc.edu>
Date:   Sun Feb 8 21:15:13 2026 -0800

    fixed layout page bugs

commit cffc946cd2fbb27b274b01f1b37464187dd7b956
Author: m-fotso <fotso@usc.edu>
Date:   Sun Feb 8 21:15:13 2026 -0800

    fixed layout page bugs

commit 7bb5337cd12fb02e031dad9773ebd47c85469857
Merge: 665d8c5 64b5eb9
Author: Marie Fotso <fotso@usc.edu>
Date:   Sun Feb 8 20:55:24 2026 -0800

    Merge pull request #1 from m-fotso/deliverable-2-parsing
    
    created upload page(w bugs)

commit 4b91b66ee7c0efb4f63f415d37fd4b453da84b24
Merge: 990577c 5d89d70
Author: Marie Fotso <fotso@usc.edu>
Date:   Sun Feb 8 20:55:24 2026 -0800

    Merge pull request #1 from m-fotso/deliverable-2-parsing
    
    created upload page(w bugs)

commit 5d89d701626b814a58c3f8294a1c1f5e83240106
Author: m-fotso <fotso@usc.edu>
Date:   Sun Feb 8 20:53:41 2026 -0800

    created upload page(w bugs)

commit 64b5eb930b43c47c73774910f4f7835c396993a4
Author: m-fotso <fotso@usc.edu>
Date:   Sun Feb 8 20:53:41 2026 -0800

    created upload page(w bugs)

commit 7d6f644ed56ed2edd8e7c1486b15e65781cabf54
Merge: a81e6e2 990577c
Author: Leow210 <leorosal@usc.edu>
Date:   Sun Feb 8 13:21:26 2026 -0800

    Add Firebase auth: login/signup functionality, user data storage, and notes s
ervice

commit effa5f5bacca463ba5bb03b9bc42a206b6625705
Merge: f83fbda 665d8c5
Author: Leow210 <leorosal@usc.edu>
Date:   Sun Feb 8 13:21:26 2026 -0800

    Add Firebase auth: login/signup functionality, user data storage, and notes s
ervice

commit a81e6e262614629a1fde74c7f9433844accbcbec
Author: Leow210 <leorosal@usc.edu>
Date:   Sun Feb 8 12:59:12 2026 -0800

    Deliverable 2: Add Firebase auth, login/signup screens, and notes service

commit f83fbda0b3269af004ac6d8f2912ca76f750d8f2
Author: Leow210 <leorosal@usc.edu>
Date:   Sun Feb 8 12:59:12 2026 -0800

    Deliverable 2: Add Firebase auth, login/signup screens, and notes service

commit 665d8c5e8f8c05039c12c04f9cadb4ca65da5de5
Author: anchals7 <anchalsr@usc.edu>
Date:   Sun Feb 8 05:03:24 2026 -0800

    Base Design + add initial app screens (landing, sign-in, sign-up, home)
    
    - Create welcome/landing page with app branding and navigation buttons
    - Add sign-in and sign-up screens with form inputs (UI only, no backend)
    - Implement home screen with user greeting, book grid, and bottom nav
    - Add dev button for temporary auth bypass during development
    - Update root layout to handle new screen routes
    - Add heart and plus icons to icon-symbol component

commit 990577cee12aac7b647575c48b27ac2351d36d65
Author: anchals7 <anchalsr@usc.edu>
Date:   Sun Feb 8 05:03:24 2026 -0800

    Base Design + add initial app screens (landing, sign-in, sign-up, home)
    
    - Create welcome/landing page with app branding and navigation buttons
    - Add sign-in and sign-up screens with form inputs (UI only, no backend)
    - Implement home screen with user greeting, book grid, and bottom nav
    - Add dev button for temporary auth bypass during development
    - Update root layout to handle new screen routes
    - Add heart and plus icons to icon-symbol component

commit 91054239f0e9773d56b35dadf5111c082e142507
Author: m-fotso <fotso@usc.edu>
Date:   Mon Feb 2 19:28:55 2026 -0800

    Proper initialize

commit c929ebf6f58b72dad2eea32c5fe3433991ab96df
Author: m-fotso <fotso@usc.edu>
Date:   Mon Feb 2 19:28:55 2026 -0800

    Proper initialize

commit 13d40f3757c32f2708ef1500ac1e20a0fda6f4eb
Author: m-fotso <fotso@usc.edu>
Date:   Mon Feb 2 19:21:21 2026 -0800

    slight error

commit 62035c5355246d35f51d442b165053b85cc7a095
Author: m-fotso <fotso@usc.edu>
Date:   Mon Feb 2 19:21:21 2026 -0800

    slight error

commit e392d69147dabe1e6f7daf3891ca72be5785844b
Author: m-fotso <fotso@usc.edu>
Date:   Mon Feb 2 18:57:33 2026 -0800

    Initialize Meaning app with Expo

commit 6e1694668a5f6227ab74ee39652049b494a2a573
Author: m-fotso <fotso@usc.edu>
Date:   Mon Feb 2 18:57:33 2026 -0800

    Initialize Meaning app with Expo

commit a3fe233e89d857ed2a830eb811cb2a5c74b0ba9b
Author: Marie Fotso <fotso@usc.edu>
Date:   Mon Feb 2 10:34:18 2026 -0800

    Initial commit

commit 53accdf198d1398f73185859c0254dcc3b1c7bb7
Author: Marie Fotso <fotso@usc.edu>
Date:   Mon Feb 2 10:34:18 2026 -0800

    Initial commit
(END)