let autoResponders = []; 

document.addEventListener('DOMContentLoaded', async () => {
    
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            
            btn.classList.add('active');
            const target = btn.getAttribute('data-target');
            document.getElementById(target).classList.add('active');
        });
    });

    try {
        
        const res = await fetch('/api/data');
        if (res.status === 401 || res.status === 403) {
            window.location.href = '/';
            return;
        }

        const data = await res.json();
        
        
        document.getElementById('loading').style.opacity = '0';
        setTimeout(() => document.getElementById('loading').style.display = 'none', 500);

        
        document.getElementById('user-profile').style.display = 'flex';
        
        const authRes = await fetch('/api/auth/status');
        const authData = await authRes.json();
        if (authData.loggedIn) {
            const user = authData.user;
            document.getElementById('user-name').textContent = user.username;
            document.getElementById('user-avatar').src = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`;
        }
        
        document.getElementById('nav-bot-name').textContent = data.botName;
        document.getElementById('nav-bot-avatar').src = data.botAvatar;

        
        const channelSelects = [
            'jailChannelId', 'logChannelId', 'welcomeChannelId', 
            'leaveChannelId', 'applicationLogChannelId', 
            'levelChannelId', 'suggestionChannelId', 'embedChannelId', 'rbChannelId',
            'tempVcHubId', 'logMessageDeleteId', 'logMessageUpdateId', 
            'logVoiceChannelId', 'logRoleUpdateId'
        ];
        
        const roleSelects = [
            'mutedRoleId', 'jailRoleId', 'autoRoleId', 
            'rbRole1', 'rbRole2', 'rbRole3', 'rbRole4', 'rbRole5'
        ];
        const categorySelects = ['ticketCategoryId', 'tempVcCategoryId']; 

        
        const textChannels = data.channels.filter(c => c.type === 0);
        const categories = data.channels.filter(c => c.type === 4);

        channelSelects.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;
            textChannels.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `# ${c.name}`;
                select.appendChild(opt);
            });
            
            if (data.config[id]) select.value = data.config[id];
        });

        categorySelects.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;
            categories.forEach(c => {
                const opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = `📁 ${c.name}`;
                select.appendChild(opt);
            });
            if (data.config[id]) select.value = data.config[id];
        });

        
        roleSelects.forEach(id => {
            const select = document.getElementById(id);
            if (!select) return;
            data.roles.forEach(r => {
                if (r.name === '@everyone') return;
                const opt = document.createElement('option');
                opt.value = r.id;
                opt.textContent = r.name;
                opt.style.color = r.color !== '#000000' ? r.color : 'inherit';
                select.appendChild(opt);
            });
            if (data.config[id]) select.value = data.config[id];
        });

        
        autoResponders = data.config.autoResponders || [];
        renderAutoResponders();

        
        const aliasSelect = document.getElementById('aliasCommand');
        if (aliasSelect) {
            aliasSelect.innerHTML = '<option value="">-- اختر الأمر الأصلي --</option>';
            const commandsList = data.commands || [];
            commandsList.forEach(cmd => {
                const opt = document.createElement('option');
                opt.value = cmd;
                opt.textContent = `/${cmd} (أو +${cmd})`;
                aliasSelect.appendChild(opt);
            });
        }
        window.commandAliases = data.config.commandAliases || [];
        renderCommandAliases();

        
        const btnSave = document.getElementById('btn-save');
        const saveStatus = document.getElementById('save-status');
        const saveBar = document.querySelector('.save-bar');
        const configForm = document.getElementById('config-form');

        
        configForm.addEventListener('change', () => {
            saveBar.classList.add('show');
            saveStatus.style.display = 'none'; 
        });
        
        btnSave.addEventListener('click', async () => {
            btnSave.disabled = true;
            btnSave.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الحفظ...';
            
            
            const formData = new FormData(configForm);
            const payload = Object.fromEntries(formData.entries());

            try {
                const updateRes = await fetch('/api/config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                
                if (updateRes.ok) {
                    saveStatus.style.display = 'inline-block';
                    btnSave.innerHTML = '<i class="fa-solid fa-floppy-disk"></i> حفظ التغييرات';
                    
                    setTimeout(() => {
                        saveBar.classList.remove('show');
                    }, 2000);
                } else {
                    alert('حدث خطأ أثناء حفظ الإعدادات!');
                }
            } catch (err) {
                console.error(err);
                alert('فشل الاتصال بالخادم!');
            } finally {
                btnSave.disabled = false;
            }
        });

        
        const btnSendEmbed = document.getElementById('btn-send-embed');
        const embedStatus = document.getElementById('embed-status');

        if (btnSendEmbed) {
            btnSendEmbed.addEventListener('click', async () => {
                const channelId = document.getElementById('embedChannelId').value;
                const title = document.getElementById('embedTitle').value;
                const description = document.getElementById('embedDescription').value;
                const color = document.getElementById('embedColor').value;
                const image = document.getElementById('embedImage').value;

                if (!channelId || !description) {
                    alert('يرجى تحديد روم المحتوى (الوصف) على الأقل!');
                    return;
                }

                btnSendEmbed.disabled = true;
                btnSendEmbed.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';

                try {
                    const res = await fetch('/api/send-embed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ channelId, title, description, color, image })
                    });
                    
                    const result = await res.json();
                    if (res.ok) {
                        embedStatus.style.display = 'inline-block';
                        embedStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> تم الإرسال بنجاح!';
                        setTimeout(() => embedStatus.style.display = 'none', 3000);
                        
                        
                        document.getElementById('embedTitle').value = '';
                        document.getElementById('embedDescription').value = '';
                        document.getElementById('embedImage').value = '';
                    } else {
                        alert('حدث خطأ: ' + (result.error || 'غير معروف'));
                    }
                } catch (err) {
                    alert('فشل الاتصال بالخادم!');
                } finally {
                    btnSendEmbed.disabled = false;
                    btnSendEmbed.innerHTML = '<i class="fa-solid fa-paper-plane"></i> إرسال الإيمبد الآن';
                }
            });
        }

        // 6. Handle Interactive Role Builder
        const btnSendRb = document.getElementById('btn-send-rb');
        const rbStatus = document.getElementById('rb-status');

        if (btnSendRb) {
            btnSendRb.addEventListener('click', async () => {
                const channelId = document.getElementById('rbChannelId').value;
                const title = document.getElementById('rbTitle').value;
                const description = document.getElementById('rbDescription').value;
                const color = document.getElementById('rbEmbedColor').value;
                const image = document.getElementById('rbImage').value;
                
                
                const roles = [];
                for (let i = 1; i <= 5; i++) {
                    const elTarget = document.getElementById(`rbRole${i}`);
                    if (!elTarget) continue;
                    
                    const roleId = elTarget.value;
                    const label = document.getElementById(`rbLabel${i}`).value;
                    const btnColor = document.getElementById(`rbColor${i}`).value;
                    if (roleId && label) {
                        roles.push({ roleId, label, color: btnColor });
                    }
                }

                if (!channelId || !description || roles.length === 0) {
                    alert('يرجى تحديد روم المحتوى وإعداد زر للرتبة واحد على الأقل!');
                    return;
                }

                btnSendRb.disabled = true;
                btnSendRb.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> جاري الإرسال...';

                try {
                    const res = await fetch('/api/send-role-embed', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ channelId, title, description, color, image, roles })
                    });
                    
                    const result = await res.json();
                    if (res.ok) {
                        rbStatus.style.display = 'inline-block';
                        rbStatus.innerHTML = '<i class="fa-solid fa-check-circle"></i> تم النشر بنجاح!';
                        setTimeout(() => rbStatus.style.display = 'none', 3000);
                        
                        document.getElementById('rbTitle').value = '';
                        document.getElementById('rbDescription').value = '';
                    } else {
                        alert('حدث خطأ: ' + (result.error || 'غير معروف'));
                    }
                } catch (err) {
                    alert('فشل الاتصال بالخادم!');
                } finally {
                    btnSendRb.disabled = false;
                    btnSendRb.innerHTML = '<i class="fa-solid fa-share-nodes"></i> إطلاق رسالة الرتب التفاعلية';
                }
            });
        }

        // 7. Handle Auto-Responders
        const btnAddAr = document.getElementById('btn-add-ar');
        const arStatus = document.getElementById('ar-status');
        
        if (btnAddAr) {
            btnAddAr.addEventListener('click', async () => {
                const trigger = document.getElementById('arTrigger').value.trim();
                const response = document.getElementById('arResponse').value.trim();
                
                if (!trigger || !response) {
                    alert('يرجى ادخال الكلمة والرد!');
                    return;
                }
                
                autoResponders.push({ trigger, response });
                
                
                document.getElementById('arTrigger').value = '';
                document.getElementById('arResponse').value = '';
                
                await saveAutoRespondersToServer();
            });
        }

        // 8. Handle Command Aliases
        const btnAddAlias = document.getElementById('btn-add-alias');
        if (btnAddAlias) {
            btnAddAlias.addEventListener('click', async () => {
                const trigger = document.getElementById('aliasTrigger').value.trim().toLowerCase();
                const commandTarget = document.getElementById('aliasCommand').value;
                
                if (!trigger || !commandTarget) {
                    alert('يرجى كتابة الاختصار واختيار الأمر الأصلي!');
                    return;
                }

                if (window.commandAliases.some(a => a.alias === trigger)) {
                    alert('هذا الاختصار موجود مسبقاً!');
                    return;
                }
                
                window.commandAliases.push({ alias: trigger, command: commandTarget });
                
                document.getElementById('aliasTrigger').value = '';
                document.getElementById('aliasCommand').value = '';
                
                await saveCommandAliasesToServer();
            });
        }

    } catch (err) {
        console.error('Failed to initialize dashboard:', err);
    }
});

// Helper for Command Aliases
async function saveCommandAliasesToServer() {
    const status = document.getElementById('alias-status');
    try {
        const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ commandAliases: window.commandAliases })
        });
        
        if (res.ok) {
            renderCommandAliases();
            if (status) {
                status.style.display = 'block';
                status.innerHTML = '<i class="fa-solid fa-check"></i> تم إضافة الاختصار بنجاح!';
                setTimeout(() => status.style.display = 'none', 3000);
            }
        } else {
            alert('حدث خطأ أثناء حفظ الاختصار');
        }
    } catch (err) {
        alert('فشل الاتصال بالخادم!');
    }
}

function renderCommandAliases() {
    const container = document.getElementById('alias-list-container');
    const emptyMsg = document.getElementById('alias-empty-msg');
    if (!container) return;
    
    const children = Array.from(container.children);
    children.forEach(child => {
        if (child.id !== 'alias-empty-msg') container.removeChild(child);
    });
    
    if (window.commandAliases.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }
    
    if (emptyMsg) emptyMsg.style.display = 'none';
    
    window.commandAliases.forEach((aliasObj, idx) => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.2); padding: 10px 15px; border-radius: 8px; border-right: 4px solid #9b59b6; border-left: 1px solid rgba(255,255,255,0.05); top: 1px solid rgba(255,255,255,0.05); bottom: 1px solid rgba(255,255,255,0.05);';
        
        div.innerHTML = `
            <div>
                <strong style="color: #9b59b6; font-size: 16px;"><i class="fa-solid fa-bolt"></i> ${aliasObj.alias}</strong>
                <i class="fa-solid fa-arrow-left" style="margin: 0 10px; color: var(--text-secondary); font-size: 12px;"></i>
                <code style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 6px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.3); font-weight: bold;">${aliasObj.command}</code>
            </div>
            <button onclick="window.deleteAlias(${idx})" class="btn-discord" style="background: var(--red); color: white; padding: 6px 12px; font-size: 13px;">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        container.appendChild(div);
    });
}

window.deleteAlias = async function(idx) {
    if (confirm('هل أنت متأكد من حذف هذا الاختصار؟')) {
        window.commandAliases.splice(idx, 1);
        await saveCommandAliasesToServer();
    }
};


async function saveAutoRespondersToServer() {
    const arStatus = document.getElementById('ar-status');
    const arEmptyObj = document.getElementById('ar-empty-msg');
    
    try {
        
        
        const res = await fetch('/api/config', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ autoResponders })
        });
        
        if (res.ok) {
            renderAutoResponders();
            if (arStatus) {
                arStatus.style.display = 'block';
                arStatus.innerHTML = '<i class="fa-solid fa-check"></i> تم الحفظ!';
                setTimeout(() => arStatus.style.display = 'none', 2000);
            }
        } else {
            alert('خطأ أثناء حفظ الرد التلقائي');
        }
    } catch (err) {
        alert('فشل الاتصال بالخادم!');
    }
}

function renderAutoResponders() {
    const container = document.getElementById('ar-list-container');
    const emptyMsg = document.getElementById('ar-empty-msg');
    if (!container) return;
    
    
    const children = Array.from(container.children);
    children.forEach(child => {
        if (child.id !== 'ar-empty-msg') container.removeChild(child);
    });
    
    if (autoResponders.length === 0) {
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }
    
    if (emptyMsg) emptyMsg.style.display = 'none';
    
    autoResponders.forEach((ar, idx) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.background = 'rgba(0,0,0,0.2)';
        div.style.padding = '10px 15px';
        div.style.borderRadius = '8px';
        div.style.border = '1px solid rgba(255,255,255,0.05)';
        
        div.innerHTML = `
            <div>
                <strong style="color: var(--blurple); font-size: 16px;">${ar.trigger}</strong>
                <i class="fa-solid fa-arrow-left" style="margin: 0 10px; color: var(--text-secondary); font-size: 12px;"></i>
                <span style="color: white;">${ar.response}</span>
            </div>
            <button onclick="deleteAr(${idx})" style="background: var(--red); color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
                <i class="fa-solid fa-trash"></i>
            </button>
        `;
        container.appendChild(div);
    });
}


window.deleteAr = async function(idx) {
    if (confirm('هل أنت متأكد من حذف هذا الرد؟')) {
        autoResponders.splice(idx, 1);
        await saveAutoRespondersToServer();
    }
};
