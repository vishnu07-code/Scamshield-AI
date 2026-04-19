document.addEventListener('DOMContentLoaded', () => {
    // Collect DOM Elements
    const messageInput = document.getElementById('messageInput');
    const highlightedMessage = document.getElementById('highlightedMessage');
    const charCountEl = document.getElementById('charCount');
    const wordCountEl = document.getElementById('wordCount');
    const imageUpload = document.getElementById('imageUpload');
    const uploadLabelText = document.getElementById('uploadLabelText');
    const fileWarningDisplay = document.getElementById('fileWarningDisplay');
    
    // Core engine interface
    const analyzeBtn = document.getElementById('analyzeBtn');
    const clearBtn = document.getElementById('clearBtn');
    const generateBtn = document.getElementById('generateBtn');
    const speakBtn = document.getElementById('speakBtn');
    const aiSimulation = document.getElementById('aiSimulation');
    const aiStatusText = document.getElementById('aiStatusText');
    
    // Dedicated Link Analyzer integration
    const linkInput = document.getElementById('linkInput');
    const analyzeLinkBtn = document.getElementById('analyzeLinkBtn');

    // Result panels UI output
    const resultContainer = document.getElementById('resultContainer');
    const resultCard = document.getElementById('resultCard');
    const resultIcon = document.getElementById('resultIcon');
    const resultLabel = document.getElementById('resultLabel');
    const riskLevelBadge = document.getElementById('riskLevelBadge');
    const confidenceStatement = document.getElementById('confidenceStatement');
    const riskPercentageEl = document.getElementById('riskPercentage');
    const progressBarFill = document.getElementById('progressBarFill');
    const trustPercentageEl = document.getElementById('trustPercentage');
    const trustBarFill = document.getElementById('trustBarFill');
    
    // Advanced feedback nodes
    const warningMessage = document.getElementById('warningMessage');
    const resultText = document.getElementById('resultText');
    const explanationEngine = document.getElementById('explanationEngine');
    const safeAlternative = document.getElementById('safeAlternative');
    const detectionTimeValue = document.getElementById('detectionTimeValue');
    const scamBreakdown = document.getElementById('scamBreakdown');
    const breakdownList = document.getElementById('breakdownList');

    // Hover Tooltip Panel Nodes
    const scamCards = document.querySelectorAll('.scam-card');
    const hoverTooltip = document.getElementById('hoverTooltip');
    const ttTitle = document.getElementById('ttTitle');
    const ttInfo = document.getElementById('ttInfo');
    const ttMessage = document.getElementById('ttMessage');

    // Interactive Right Panel Logic
    const safetyCards = document.querySelectorAll('.safety-tip-card');

    safetyCards.forEach(card => {
        card.addEventListener('click', () => {
            card.classList.toggle('active');
        });
    });

    // System States
    let currentSpeechText = '';

    const fakeMessagesDB = [
        "URGENT: Your bank account is blocked! Click here to verify now: http://verify-account-now.xyz",
        "Congratulations!!! You won the $15000 prize lottery. Claim your money instant! https://free-money-claim.net",
        "Delivery attempt failed. A $2.99 fee is required to redeliver your package. http://delivery-fee-pay.com",
        "Telegram daily job offer! Earn $500 salary daily guaranteed just for clicking. http://click-jobs.net",
        "Mom I had an accident at the hospital! Please send money fast no risk. https://help-funds.com",
        "Warning: Highway toll penalty overdue. Pay fee immediately to avoid massive penalties. http://toll-pay.xyz"
    ];

    const keywords = [
        { word: 'verify immediately', score: 4 }, { word: 'click now', score: 4 },
        { word: 'limited offer', score: 4 }, { word: 'verify now', score: 4 },
        { word: 'offer ends', score: 4 }, { word: 'act now', score: 4 },
        { word: 'pay fee', score: 4 }, { word: 'urgent', score: 3 }, 
        { word: 'money', score: 3 }, { word: 'lottery', score: 3 },
        { word: 'claim', score: 3 }, { word: 'exclusive', score: 3 },
        { word: 'guaranteed', score: 3 }, { word: 'no risk', score: 3 },
        { word: 'hurry', score: 3 }, { word: 'delivery', score: 3 },
        { word: 'fee', score: 3 }, { word: 'pay', score: 3 },
        { word: 'verify', score: 3 }, { word: 'account', score: 3 },
        { word: 'blocked', score: 3 }, { word: 'immediately', score: 3 },
        { word: 'free', score: 2 }, { word: 'win', score: 2 },
        { word: 'prize', score: 2 }, { word: 'congratulations', score: 2 },
        { word: 'bonus', score: 2 }, { word: 'instant', score: 2 },
        { word: 'selected', score: 2 }, { word: 'failed', score: 2 },
        { word: 'now', score: 2 }
    ];

    const scamTypes = [
        { type: 'Phishing Scam', keywords: ['bank', 'verify', 'account', 'blocked'], consequence: "Phishing → Your banking details or identity may be stolen." },
        { type: 'Delivery Scam', keywords: ['package', 'delivery', 'fee', 'failed'], consequence: "Delivery → You may lose money paying fake redelivery fees." },
        { type: 'Emergency Scam', keywords: ['accident', 'hospital', 'money'], consequence: "Emergency → You may send money directly to scammers." },
        { type: 'Prize Scam', keywords: ['prize', 'gift', 'win', 'lottery', 'congratulations', 'free'], consequence: "Prize → You may be tricked into sharing personal information." },
        { type: 'Job Scam', keywords: ['job', 'salary', 'telegram'], consequence: "Job → You may be redirected to fake platforms aiming to steal advance fees." },
        { type: 'Toll Scam', keywords: ['toll', 'penalty', 'pay fee'], consequence: "Toll → You may pay fake penalties giving away your credit card." }
    ];

    const STORAGE_KEY_ANALYTICS = 'fmd_analytics_v5';
    const STORAGE_KEY_HISTORY = 'fmd_history_v5';
    let analytics = JSON.parse(localStorage.getItem(STORAGE_KEY_ANALYTICS)) || { total: 0, genuine: 0, suspicious: 0, fake: 0 };
    let history = JSON.parse(localStorage.getItem(STORAGE_KEY_HISTORY)) || [];

    function syncDashboard() {
        document.getElementById('statTotal').textContent = analytics.total;
        document.getElementById('statGenuine').textContent = analytics.genuine;
        document.getElementById('statSuspicious').textContent = analytics.suspicious;
        document.getElementById('statFake').textContent = analytics.fake;
    }
    
    function syncHistory() {
        const list = document.getElementById('historyList');
        list.innerHTML = '';
        if(history.length === 0){
            list.innerHTML = '<li class="history-item"><span class="history-text">No scans found in history.</span></li>';
            return;
        }
        history.forEach(item => {
            const li = document.createElement('li');
            li.className = `history-item ${item.statusClass}`;
            const preview = item.text.length > 50 ? item.text.substring(0, 47) + '...' : item.text;
            
            let consqHtml = item.consequence ? `<div class="history-consequences">⚠️ What happens if clicked: ${item.consequence}</div>` : '';
            li.innerHTML = `
                <div class="history-row-top">
                    <span class="history-label">${item.label}</span> 
                    <span class="history-text">${preview}</span>
                </div>
                ${consqHtml}
            `;
            list.appendChild(li);
        });
    }

    function triggerSpeech(text) {
        if('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(text);
            window.speechSynthesis.speak(utterance);
        }
    }

    syncDashboard();
    syncHistory();

    // Tooltip Hover Action Logic
    scamCards.forEach(card => {
        card.addEventListener('mouseenter', (e) => {
            const title = card.getAttribute('data-title');
            const info = card.getAttribute('data-info');
            let exampleRawTxt = card.textContent.trim();
            
            const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|xyz)(\/[^\s]*)?)/gi;
            let formattedMessage = exampleRawTxt.replace(linkRegex, `<span class="highlight-link">$&</span>`);
            
            ttTitle.textContent = title;
            ttInfo.textContent = info;
            ttMessage.innerHTML = formattedMessage;
            
            const rect = card.getBoundingClientRect();
            let xOffset = rect.right + window.scrollX + 20;
            let yOffset = rect.top + window.scrollY - 10;
            
            if(window.innerWidth < (rect.right + 360)) {
                xOffset = rect.left + window.scrollX;
                yOffset = rect.bottom + window.scrollY + 15;
            }

            hoverTooltip.style.left = `${xOffset}px`;
            hoverTooltip.style.top = `${yOffset}px`;
            
            hoverTooltip.classList.add('visible');
        });

        card.addEventListener('mouseleave', () => {
            hoverTooltip.classList.remove('visible');
        });
    });

    generateBtn.addEventListener('click', () => {
        const randomMsg = fakeMessagesDB[Math.floor(Math.random() * fakeMessagesDB.length)];
        messageInput.value = randomMsg;
        messageInput.dispatchEvent(new Event('input')); 
        highlightedMessage.classList.add('hidden');
        messageInput.classList.remove('hidden');
    });

    speakBtn.addEventListener('click', () => triggerSpeech(currentSpeechText));

    imageUpload.addEventListener('change', (e) => {
        if(e.target.files && e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            uploadLabelText.textContent = `📎 ${fileName}`;
            fileWarningDisplay.innerHTML = `⚠️ Image <b>${fileName}</b> uploaded. This may contain scam content.`;
            fileWarningDisplay.classList.remove('hidden');
        }
    });

    messageInput.addEventListener('input', () => {
        const text = messageInput.value;
        charCountEl.textContent = `${text.length} characters`;
        const words = text.trim().split(/\s+/).filter(w => w.length > 0);
        wordCountEl.textContent = `${words.length} words`;
    });

    // Sub-Analyzer logic explicitly tailored for standard URL checking
    analyzeLinkBtn.addEventListener('click', () => {
        let url = linkInput.value.trim().toLowerCase();
        if(!url) return;

        resultContainer.classList.add('hidden');
        aiSimulation.classList.remove('hidden');
        aiStatusText.textContent = "Scanning dedicated link parameters...";

        setTimeout(() => {
            aiSimulation.classList.add('hidden');
            processLinkAnalysis(url);
        }, 1000);
    });

    function processLinkAnalysis(url) {
        const t0 = performance.now();
        let score = 0;
        let breakdownMemory = [];
        let detectedWords = [];

        // Insecure Protocol Check
        if (url.startsWith('http://') || !url.includes('https://')) {
            score += 2;
            breakdownMemory.push('Insecure HTTP protocol <span class="pts">+2</span>');
        }

        // TLD checking bounds
        const badDomains = ['.xyz', '.top', '.click', '.club', '.online'];
        const matchedDomain = badDomains.find(d => url.includes(d));
        if (matchedDomain) {
            score += 3;
            breakdownMemory.push(`Suspicious top-level domain (${matchedDomain}) <span class="pts">+3</span>`);
        }

        // Action Keyword payload parsing
        const linkKeywords = ['verify', 'login', 'free', 'win', 'claim', 'bank', 'update'];
        linkKeywords.forEach(kw => {
            if (url.includes(kw)) {
                score += 2;
                detectedWords.push(kw);
                breakdownMemory.push(`Phishing keyword [${kw}] <span class="pts">+2</span>`);
            }
        });

        // 7 total score max scaling dynamically mapped.
        let riskValue = Math.min(100, Math.floor((score / 7) * 100)); 
        
        let statusClass = '', statusLabel = '';
        resultCard.className = 'result-card'; 

        let escapedUrl = url.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));
        let formattedUrl = escapedUrl;

        if (score >= 5 || riskValue >= 60) {
            statusClass = 'fake';
            statusLabel = `Dangerous Link`;
            resultCard.classList.add('fake');
            resultIcon.textContent = '❌';
            riskLevelBadge.textContent = 'High Risk';
            currentSpeechText = "Warning! This link is dangerous.";
            warningMessage.innerHTML = '⚠️ High Risk: Link hosts malicious properties. Do not open.';
            riskValue = Math.max(75, riskValue);
            formattedUrl = `<span class="highlight-word" style="background:rgba(239, 68, 68, 0.3); color:#fca5a5; padding: 4px; border-radius: 6px;">${escapedUrl}</span>`;
        } else if (score >= 2 || riskValue >= 25) {
            statusClass = 'suspicious';
            statusLabel = `Suspicious Link`;
            resultCard.classList.add('suspicious');
            resultIcon.textContent = '⚠️';
            riskLevelBadge.textContent = 'Medium Risk';
            currentSpeechText = "Caution! This link involves suspicious bounds.";
            warningMessage.innerHTML = '⚠️ Caution: Link uses erratic formatting vectors.';
            formattedUrl = `<span style="color:var(--warning-color); font-weight:bold;">${escapedUrl}</span>`;
            riskValue = Math.max(35, riskValue);
        } else {
            statusClass = 'genuine';
            statusLabel = `Safe Link`;
            resultCard.classList.add('genuine');
            resultIcon.textContent = '✔';
            riskLevelBadge.textContent = 'Low Risk';
            currentSpeechText = "This link appears to be safe.";
            warningMessage.innerHTML = '✅ Looks Safe: Valid structure detected natively.';
            riskValue = Math.min(10, riskValue);
        }
        
        resultLabel.textContent = statusLabel;
        warningMessage.classList.remove('hidden');

        let explStr = `Deep Link Scan: Protocol endpoint and structural formatting analyzed.`;
        if (score > 0) explStr = `Deep Link Scan: This link contains properties matching common phishing architectures.`;
        if ((url.startsWith('http://') || !url.includes('https://')) && detectedWords.length > 0) {
            explStr = `Deep Link Scan: This link uses an insecure protocol and inherently houses external phishing keywords.`;
        }
        
        explanationEngine.textContent = explStr;
        explanationEngine.classList.remove('hidden');
        safeAlternative.classList.add('hidden'); 

        if (breakdownMemory.length > 0) {
            breakdownList.innerHTML = breakdownMemory.map(str => `<li>${str}</li>`).join('');
            scamBreakdown.classList.remove('hidden');
        } else {
            scamBreakdown.classList.add('hidden');
        }

        resultText.innerHTML = `<strong>Validated Remote URL String:</strong><br><br>${formattedUrl}`;

        let confidencePercent = statusClass === 'fake' ? Math.min(99, Math.max(80, riskValue + 15)) :
                                statusClass === 'suspicious' ? Math.max(50, riskValue) :
                                Math.min(99, 100 - riskValue);

        confidenceStatement.innerHTML = statusClass === 'genuine' 
            ? `We are <b style="color:var(--success-color)">${confidencePercent}%</b> confident this link is completely safe.` 
            : `We are <b style="color:var(--danger-color)">${confidencePercent}%</b> confident this is a deployed malicious address.`;

        riskPercentageEl.textContent = `${riskValue}%`;
        progressBarFill.style.width = '0%'; 
        trustPercentageEl.textContent = `${100 - riskValue}%`;
        trustBarFill.style.width = '0%';

        setTimeout(() => { 
            progressBarFill.style.width = `${riskValue}%`; 
            trustBarFill.style.width = `${100 - riskValue}%`; 
        }, 80);

        detectionTimeValue.textContent = ((performance.now() - t0) / 1000).toFixed(4);

        resultContainer.classList.remove('hidden');
        resultCard.style.animation = 'none';
        resultCard.offsetHeight;
        resultCard.style.animation = 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';

        analytics.total++;
        if (statusClass === 'fake') analytics.fake++;
        else if (statusClass === 'suspicious') analytics.suspicious++;
        else analytics.genuine++;
        localStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(analytics));
        syncDashboard(); 
        
        const historyObj = { text: `[Link Analyzer] ${url}`, label: statusLabel, statusClass: statusClass, consequence: "External Redirection Request" };
        history.unshift(historyObj);
        if (history.length > 5) history.pop();
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
        syncHistory();
        triggerSpeech(currentSpeechText);
    }

    analyzeBtn.addEventListener('click', () => {
        const originalMessage = messageInput.value;
        const message = originalMessage.trim().toLowerCase();
        const hasImage = imageUpload.files.length > 0;
        
        if (!message && !hasImage) return;

        resultContainer.classList.add('hidden');
        aiSimulation.classList.remove('hidden');
        aiStatusText.textContent = "Analyzing structure & phrases...";
        
        setTimeout(() => { aiStatusText.textContent = 'Cross-referencing fraud signatures...'; }, 400);
        setTimeout(() => { aiStatusText.textContent = 'Finalizing risk assessment metrics...'; }, 800);
        
        setTimeout(() => {
            aiSimulation.classList.add('hidden');
            processAnalysis(originalMessage, message, hasImage);
        }, 1200);
    });

    // Core Logical Array Engine
    function processAnalysis(originalMessage, message, hasImage) {
        const t0 = performance.now(); 
        
        let totalScore = 0;
        let detected = [];
        let breakdownMemory = []; 
        let rawTraits = []; 
        
        // 1. Initial Link Sweep Boundary
        const linkRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(com|net|xyz)(\/[^\s]*)?)/gi;
        let hasLink = linkRegex.test(originalMessage);

        // 2. Safe Banking Protection Vectors
        const safeBankKeywords = ['credited', 'debited', 'avl bal', 'available balance', 'upi', 'txn id', 'transaction id'];
        let isSafeBankContext = false;
        
        // 3. Phishing Trait Analysis
        const urgencyActionWords = ['urgent', 'immediately', 'verify', 'click', 'pay'];
        let hasUrgencyOrAction = urgencyActionWords.some(kw => message.includes(kw));
        
        if (!hasLink) {
            isSafeBankContext = safeBankKeywords.some(kw => message.includes(kw));
        }

        let detectedScamTypes = [];
        let consequenceMapping = null;

        scamTypes.forEach(scam => {
            if (scam.keywords.some(kw => message.includes(kw))) {
                detectedScamTypes.push(scam.type);
                if(!consequenceMapping) consequenceMapping = scam.consequence;
            }
        });
        
        if (detectedScamTypes.length > 0) {
            totalScore += 2;
            breakdownMemory.push(`Scam category signature detected (${detectedScamTypes[0]}) <span class="pts">+2</span>`);
        }

        let escapedHtml = originalMessage.replace(/[&<>'"]/g, tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag));
        let highlightedHtml = escapedHtml;

        if (hasLink) {
            totalScore += 5;
            detected.push('MALICIOUS LINK');
            rawTraits.push('External link detected, which is commonly used in scams');
            breakdownMemory.push(`External link detected <span class="pts">+5</span>`);
            
            // Highlight links natively BEFORE word strings to protect the HTML DOM string
            highlightedHtml = highlightedHtml.replace(linkRegex, `<span class="highlight-word" style="background:rgba(147,51,234,0.4); color:#c084fc;">$&</span>`);
        }

        const sortedKeywords = [...keywords].sort((a,b) => b.word.length - a.word.length);

        sortedKeywords.forEach(k => {
            if (message.includes(k.word)) {
                totalScore += k.score;
                detected.push(k.word);
                breakdownMemory.push(`Fraud keyword / phrase [${k.word}] <span class="pts">+${k.score}</span>`);
                
                // ONLY highlight text not already bound inside an HTML element using (?![^<]*>)
                const regex = new RegExp(`(${k.word})(?![^<]*>)`, 'gi');
                highlightedHtml = highlightedHtml.replace(regex, `<span class="highlight-word">$1</span>`);
            }
        });

        const alphaChars = originalMessage.replace(/[^a-zA-Z]/g, '');
        if (alphaChars.length > 5 && alphaChars === alphaChars.toUpperCase()) {
            totalScore += 2;
            detected.push('ALL CAPS FLAG');
            breakdownMemory.push(`ALL CAPS aggressive formatting <span class="pts">+2</span>`);
        }
        
        if (originalMessage.includes('!!!')) {
            totalScore += 2;
            detected.push('EXCLAMATION FLAG');
            breakdownMemory.push(`Aggressive punctuation (!!!) <span class="pts">+2</span>`);
        }
        
        if (hasImage) {
            totalScore += 4;
            detected.push('IMAGE ATTACHED');
            rawTraits.push('image payload delivery');
            breakdownMemory.push(`Image payload detected <span class="pts">+4</span>`);
        }
        
        if (/(fee|pay|money|account|bank)/i.test(detected.join(' '))) rawTraits.push("payment & finance requests");
        if (/(urgent|now|immediately|hurry)/i.test(detected.join(' '))) rawTraits.push("manufactured urgency");
        if (/(win|prize|free|lottery)/i.test(detected.join(' '))) rawTraits.push("unrealistic rewards");

        // 4. Mathematical Neutralization For Safe Contexts
        let safeExplanationOverride = null;

        if (isSafeBankContext && !hasUrgencyOrAction && !hasLink) {
            // Nullify score aggressively for legitimate strings bounding standard banking features
            totalScore = 0;
            breakdownMemory.push(`Safe banking transaction characteristics mapped <span class="pts" style="color:var(--success-color)">SAFE</span>`);
            detectedScamTypes = []; // Clear erroneous type mappings
            safeExplanationOverride = "Deep Scan Analysis: This appears to be a normal banking transaction message without suspicious links or actions.";
        } else if (!hasLink && totalScore > 0) {
            // Drop slight scaling metrics for safely routed text blobs
            totalScore = Math.max(0, totalScore - 1);
            breakdownMemory.push(`No links detected (safer architecture) <span class="pts" style="color:var(--success-color)">-1</span>`);
        }

        let riskValue = Math.min(100, Math.floor((totalScore / 10) * 100)); 
        
        // Massive risk validation mappings globally bounds overrides
        if (hasLink && totalScore < 3) {
            totalScore = 3;
            riskValue = Math.max(30, riskValue);
        }

        let typeString = detectedScamTypes.length > 0 ? ` (${detectedScamTypes[0]})` : '';
        let statusClass = '', statusLabel = '';
        
        resultCard.className = 'result-card'; 
        
        if (totalScore >= 6 || riskValue >= 60) {
            statusClass = 'fake';
            statusLabel = `Fake Message${typeString}`;
            resultCard.classList.add('fake');
            resultIcon.textContent = '❌';
            resultLabel.textContent = statusLabel;
            riskLevelBadge.textContent = 'High Risk';
            
            warningMessage.innerHTML = '⚠️ High Risk: This message is a recognized threat profile.';
            warningMessage.classList.remove('hidden');
            safeAlternative.classList.remove('hidden');
            
            currentSpeechText = "Warning! This message is likely fake.";
            riskValue = Math.max(75, riskValue);

        } else if (totalScore >= 3 || riskValue >= 25) {
            statusClass = 'suspicious';
            statusLabel = `Suspicious Message${typeString}`;
            resultCard.classList.add('suspicious');
            resultIcon.textContent = '⚠️';
            resultLabel.textContent = statusLabel;
            riskLevelBadge.textContent = 'Medium Risk';
            
            warningMessage.innerHTML = '⚠️ Caution: Proceed with absolute care. Verification needed.';
            warningMessage.classList.remove('hidden');
            safeAlternative.classList.remove('hidden');
            
            currentSpeechText = "Caution! This message looks suspicious.";

        } else {
            statusClass = 'genuine';
            statusLabel = 'Genuine Message';
            resultCard.classList.add('genuine');
            resultIcon.textContent = '✔';
            resultLabel.textContent = statusLabel;
            riskLevelBadge.textContent = 'Low Risk';
            
            warningMessage.innerHTML = '✅ Looks Safe: No common manipulative patterns flagged.';
            warningMessage.classList.remove('hidden');
            safeAlternative.classList.add('hidden');
            
            currentSpeechText = "This message appears to be safe.";
            riskValue = Math.min(10, riskValue);
        }

        let confidencePercent = 0;
        if (statusClass === 'fake') confidencePercent = Math.min(99, Math.max(80, riskValue + 15));
        else if (statusClass === 'suspicious') confidencePercent = Math.max(50, riskValue);
        else confidencePercent = Math.min(99, 100 - riskValue);
        
        if (statusClass === 'genuine') {
            confidenceStatement.innerHTML = `We are <b style="color:var(--success-color)">${confidencePercent}%</b> confident this message is safe.`;
        } else {
            confidenceStatement.innerHTML = `We are <b style="color:var(--danger-color)">${confidencePercent}%</b> confident this is a scam attempt.`;
        }
        
        let explanationTextStr = rawTraits.length > 0 
            ? `Deep Scan Analysis: Evaluated message utilizing ${rawTraits.join(', ')} patterns commonly attached to automated scams.` 
            : `Deep Scan Analysis: Evaluated against heuristic rules. Base patterns align cleanly with natural phrasing limits.`;
            
        // Map explicitly generated secure override values internally
        if (safeExplanationOverride) {
            explanationTextStr = safeExplanationOverride;
        }
            
        explanationEngine.textContent = explanationTextStr;
        explanationEngine.classList.remove('hidden');

        let trustValue = 100 - riskValue;
        triggerSpeech(currentSpeechText);

        if(message) {
            messageInput.classList.add('hidden');
            highlightedMessage.innerHTML = highlightedHtml;
            highlightedMessage.classList.remove('hidden');
        }

        riskPercentageEl.textContent = `${riskValue}%`;
        progressBarFill.style.width = '0%'; 
        trustPercentageEl.textContent = `${trustValue}%`;
        trustBarFill.style.width = '0%';

        setTimeout(() => { 
            progressBarFill.style.width = `${riskValue}%`; 
            trustBarFill.style.width = `${trustValue}%`; 
        }, 80);

        if (breakdownMemory.length > 0) {
            breakdownList.innerHTML = breakdownMemory.map(str => `<li>${str}</li>`).join('');
            scamBreakdown.classList.remove('hidden');
        } else {
            scamBreakdown.classList.add('hidden');
        }

        if (detected.length > 0) {
            const tags = detected.map(kw => `<span class="keyword-tag">${kw}</span>`).join('');
            resultText.innerHTML = `<strong>Total Computed Analytics Score: ${totalScore}</strong><br><div class="keyword-list">${tags}</div>`;
        } else {
            resultText.innerHTML = `<strong>Total Computed Analytics Score: ${totalScore}</strong><br>No flagged sequences evaluated.`;
        }

        const t1 = performance.now();
        const coreTimeSeconds = ((t1 - t0) / 1000).toFixed(4);
        detectionTimeValue.textContent = coreTimeSeconds;

        resultContainer.classList.remove('hidden');
        resultCard.style.animation = 'none';
        resultCard.offsetHeight;
        resultCard.style.animation = 'slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards';

        analytics.total++;
        if (statusClass === 'fake') analytics.fake++;
        else if (statusClass === 'suspicious') analytics.suspicious++;
        else analytics.genuine++;
        
        localStorage.setItem(STORAGE_KEY_ANALYTICS, JSON.stringify(analytics));
        syncDashboard(); 
        
        let rawHistoryText = originalMessage;
        if(hasImage && !originalMessage) rawHistoryText = `[Image Upload] ${imageUpload.files[0].name}`;
        
        const historyObj = { text: rawHistoryText || 'Empty Scan', label: statusLabel, statusClass: statusClass, consequence: consequenceMapping };
        history.unshift(historyObj);
        if (history.length > 5) history.pop();
        
        localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(history));
        syncHistory();
    }

    clearBtn.addEventListener('click', () => {
        messageInput.value = '';
        messageInput.classList.remove('hidden');
        charCountEl.textContent = '0 characters';
        wordCountEl.textContent = '0 words';
        
        imageUpload.value = '';
        uploadLabelText.textContent = "📎 Upload Image for Inspection";
        fileWarningDisplay.classList.add('hidden');
        fileWarningDisplay.innerHTML = '';
        
        highlightedMessage.classList.add('hidden');
        highlightedMessage.innerHTML = '';
        
        linkInput.value = '';

        resultContainer.classList.add('hidden');
        aiSimulation.classList.add('hidden');
        messageInput.focus();
    });
});
