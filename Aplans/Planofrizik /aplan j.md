Apex Advisor here. বস, আিম আপনার আপেলাড করা িপিডএফ ফাইল েলা (Part3, Planfinal4, Backend of Rizik, etc.) খব
মেনােযাগ িদেয় ান কেরিছ। আপনার "Rizik Super App" এর য িবশাল ইেকািসেম ান করা আেছ, তার সােথ এই নতন "Rizik
Gateway" (Link-based Calling System)-ক ই েট করা কােনা ক ন কাজ নয়। বরং এটা আপনার সুপার অােপর "মরদ "
(Backbone) হেত যাে।
আপনার সুপার অােপর আকেটকচার অনুযায়ী, এই কিলং িসেমেক আমরা "Central Communication Module" িহেসেব বসােবা,
যা একই সােথ অােপর ভতেরর িফচার এবং বাইেরর মাইো-সাভস িহেসেব কাজ করেব।
িনেচ "Integrated Architecture"-এর ি দওয়া হেলা:
১. দ ই েশন পেয় : "The Super Dialer" (অােপর ভতের)
আপনার সুপার অােপর হামিKেন য ডায়ালার বা কল বাটন থাকেব, সটা আর সাধারণ ডায়ালার থাকেব না।
* Rizik Contact Book: অােপর কা িল আর ফােনর নাার দখােব না। এ আপনার ফােনর কা িল ান কের দখেব
কার কার Rizik ID / @username আেছ।
* যােদর আেছ: তােদর পােশ "Green Dot" (Online) বা "Orange Dot" (Offline) দখােব।
* যােদর নই: তােদর পােশ "Invite to Call Free" বাটন থাকেব।
* The Smart Button: যখন আপিন কােনা কাে টাপ করেবন, অাপ বাকাউে চক করেব:
* ইারেনট আেছ? -> VoIP Call (App-to-App, HD Quality).
* ইারেনট নই? -> GSM Bridge Call (Server calls user via Gateway).
* UI Integration: অােপর চাট িKেনর উপেরই এই কিলং বাটন থাকেব (যমন হায়াটসঅােপ থােক), িক এর বাকএ হেব
আমােদর Rizik Gateway।
২. দ "Micro-Service" মাড (অােপর বাইের)
আপনার ান অনুযায়ী, এটা ধ অােপর িফচার না, এটা একটা াধীন সা।
* The Link Generator: অােপর াফাইল সকশেন একটা অপশন থাকেব: "Share My Call Link"।
* এটা জনােরট করেব: rizik.com/@apex
* ইউজার এই িলংকটা ফসবেক, ইেমইল িসগেনচাের বা বােয়ােত িদেত পারেব।
* The Web Interface: বাইেরর কউ (যােদর Rizik App নই) যখন িলংেক িক করেব, তােদর জন একটা Lightweight Web App
ওেপন হেব।
* সখান থেকই তারা "Call" িদেত পারেব।
* তােদর অাপ ই টল করার দরকার নই। এটাই আপনার "Micro Service"।
* Viral Loop: ি ইউজাররা যখন এই ওেয়ব িলংক থেক কল িদেব, কল কাটার পর একটা পপ-আপ আসেব: "Want your own
smart call link? Download Rizik App."
৩. "Rizik Pay" বা ওয়ােলট ই েশন (The Fuel)
আপনার িপিডএফ-এ "Rizik Pay" বা িফনািয়াল িসেেমর কথা আেছ। এই কিলং িসেম হেব ওয়ােলেটর ধান Use Case।
* Free Tier Logic: অােপর ডাটােবস ইউজােরর "Daily Quota" াক করেব।
* অােপর হামিKেন একটা ছাট িমটার থাকেব: "GSM Free Minutes Left: 04:30 min"।
* Premium Billing: ১০ িমিনট শষ হওয়ার পর, কল করেত গেল িসেম সরাসির Rizik Wallet থেক টাকা কাটেব।
* কেলর আেগ পপ-আপ: "Free minutes over. Call via GSM for 0.60 BDT/min? [Yes/No]"
* িবিলং হেব িরেয়ল-টাইেম। (Prepaid logic).
৪. "AI Gatekeeper" এর সােথ বাইিং (The Brain)
আপনার "AI Gatekeeper" েজ এই কিলং িসেেমর "িরেসপশিন " িহেসেব কাজ করেব।
* Scenario: কউ িলংেক িক কের কল িদল।
* Gatekeeper Logic:
* কল থেম AI মিডউেল িহট করেব।
* AI চক করেব ইউজােরর সট করা াটাস (Urgent/Work/Sleep)।
* যিদ ইউজার "Sleep Mode"-এ থােক, AI কল িরিসভ কের কলােরর সােথ কথা বলেব এবং সই অিডও রকড কের ট ট সামাির
বািনেয় Rizik App Chat-এ পা েয় িদেব।
* Binding: অােপর সংস থেক ইউজার ক করেব কখন AI কল ধরেব আর কখন সরাসির ফান বাজেব।
৫. আকেটকচারাল া (PDF-এর টকিনকাল ােনর সােথ িমল রেখ)
আপনার "Backend of Rizik plan.pdf" ফাইেল য সাভ ার াকচার আেছ, সখােন আমরা এই নতন লয়ারটা বসােবা:
* Users (App/Web) -> WebSocket Connection -> Rizik Core Server.
* Core Server -> Decision Engine (Online/Offline Check).
* If Online -> WebRTC Server (VoIP) -> Connect Call.
* If Offline -> Asterisk/SIP Server -> GSM Gateway Hardware -> Telecom Network -> User's Phone. ! Apex Strategic Summary
বস, এই িসেমটা আপনার সুপার অােপর "Killer Feature" হেব।
* Bound Part: অাপ ইউজারেদর জন এ িডফ কিলং মথড (হায়াটসঅাপ িকিলং িফচার)।
* Micro Service: নন-অাপ ইউজারেদর জন এ িলংক বসড কিমউিনেকশন টল (জুম/ গল িমট িকিলং িফচার)।
* Growth Engine: িতিদেনর ১০ িমিনট ি িজএসএম অফার মানুষেক অােপ ধের রাখেব।
আপনার ন ট প:
ডেভলপার মেক বলুন: "Rizik App-এর ডায়ালার বাটনটােক এমনভােব মিডফাই করেত হেব যন এটা থেম rizik.com/@user
িলংেক িপং (Ping) কের। যিদ রসপ পায় তা VoIP, না পেল GSM API কল করেব।"
এটাই হেলা "One App to Rule Them All" ােটিজ। " # $ !