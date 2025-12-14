const STORAGE_KEY = "simpleSongApp_v4";

let songs = [];

// ===== DOM：各个界面 =====
const screens = {
    home: document.getElementById("screen-home"),
    add: document.getElementById("screen-add"),
    display: document.getElementById("screen-display"),
    comment: document.getElementById("screen-comment"),
    delete: document.getElementById("screen-delete")
};

// 主菜单按钮
const btnHomeAdd = document.getElementById("btn-home-add");
const btnHomeComment = document.getElementById("btn-home-comment");
const btnHomeDisplay = document.getElementById("btn-home-display");
const btnHomeDelete = document.getElementById("btn-home-delete");

// Add 界面模式按钮 & 面板
const btnAddSingleMode = document.getElementById("btn-add-single");
const btnAddBulkMode = document.getElementById("btn-add-bulk");
const panelAddSingle = document.getElementById("panel-add-single");
const panelAddBulk = document.getElementById("panel-add-bulk");

// 单曲表单
const form = document.getElementById("song-form");
const titleInput = document.getElementById("title");
const artistInput = document.getElementById("artist");
const dateInput = document.getElementById("date");
const scoreInput = document.getElementById("score");
const commentInput = document.getElementById("comment");

// 批量导入
const bulkInput = document.getElementById("bulk-input");
const bulkResult = document.getElementById("bulk-result");
const btnBulkImport = document.getElementById("btn-bulk-import");
const btnBulkClear = document.getElementById("btn-bulk-clear");

// Display 界面
const displayTbody = document.getElementById("display-tbody");
const displayEmpty = document.getElementById("display-empty");

// Comment 界面
const commentTbody = document.getElementById("comment-tbody");
const commentEmpty = document.getElementById("comment-empty");

// Delete 界面
const deleteTbody = document.getElementById("delete-tbody");
const deleteEmpty = document.getElementById("delete-empty");
const btnClearAll = document.getElementById("btn-clear-all");

/* ========= LocalStorage ========= */

function loadFromStorage() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        songs = raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("读取本地存储失败", e);
        songs = [];
    }
}

function saveToStorage() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(songs));
}

/* ========= 日期校验 ========= */

function isValidDate(str) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(str)) return false;
    const d = new Date(str);
    if (Number.isNaN(d.getTime())) return false;
    const [y, m, day] = str.split("-").map(Number);
    return (
        d.getFullYear() === y &&
        d.getMonth() + 1 === m &&
        d.getDate() === day
    );
}

/* ========= 排序 ========= */

function sortSongsByDate() {
    songs.sort((a, b) => {
        if (!a.date && !b.date) return 0;
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
    });
}

/* ========= 界面切换 ========= */

function showScreen(name) {
    Object.values(screens).forEach(sec => sec.classList.remove("active"));
    const target = screens[name];
    if (target) target.classList.add("active");

    if (name === "display") renderDisplayTable();
    if (name === "comment") renderCommentTable();
    if (name === "delete") renderDeleteTable();
}

/* ========= Add 模式切换 ========= */

function setAddMode(mode) {
    if (mode === "single") {
        btnAddSingleMode.classList.add("active");
        btnAddBulkMode.classList.remove("active");
        panelAddSingle.classList.add("active");
        panelAddBulk.classList.remove("active");
    } else {
        btnAddSingleMode.classList.remove("active");
        btnAddBulkMode.classList.add("active");
        panelAddSingle.classList.remove("active");
        panelAddBulk.classList.add("active");
    }
}

/* ========= 歌曲详情弹窗 ========= */

function showSongDetail(song) {
    const scoreText =
        song.score == null ? "暂无评分" : `评分：${song.score}`;
    const commentText =
        !song.comment || song.comment.trim() === ""
            ? "暂无评论"
            : `评论：${song.comment}`;

    const msg =
        `歌名：${song.title}\n` +
        `歌手：${song.artist}\n` +
        `添加日期：${song.date || "未知"}\n` +
        `${scoreText}\n` +
        `${commentText}`;

    alert(msg);
}

/* ========= 添加函数 ========= */

function isDuplicateSong(title, artist) {
    const t = title.trim().toLowerCase();
    const a = artist.trim().toLowerCase();
    return songs.some(
        s =>
            s.title.trim().toLowerCase() === t &&
            s.artist.trim().toLowerCase() === a
    );
}

/**
 * 尝试添加一首歌。
 * 返回：{ ok: boolean, message?: string }
 */
function addSongInternal(title, artist, date, score, comment) {
    const t = (title || "").trim();
    const a = (artist || "").trim();
    const d = (date || "").trim();

    if (!t || !a || !d) {
        return { ok: false, message: "歌名、歌手和日期不能为空。" };
    }

    if (!isValidDate(d)) {
        return { ok: false, message: "日期格式应为 YYYY-MM-DD。" };
    }

    if (isDuplicateSong(t, a)) {
        return { ok: false, message: "该歌曲已经存在（歌名 + 歌手相同）。" };
    }

    let finalScore = null;
    if (score != null) {
        const n = Number(score);
        if (Number.isNaN(n) || n < 1 || n > 10) {
            return { ok: false, message: "评分必须在 1–10 之间，或留空。" };
        }
        finalScore = n;
    }

    const obj = {
        id: Date.now() + Math.random(),
        title: t,
        artist: a,
        date: d,
        score: finalScore,
        comment: (comment || "").trim()
    };

    songs.push(obj);
    saveToStorage();
    return { ok: true };
}

/* ========= 表格渲染 ========= */

function renderDisplayTable() {
    displayTbody.innerHTML = "";
    sortSongsByDate();

    if (songs.length === 0) {
        displayEmpty.style.display = "block";
        return;
    }
    displayEmpty.style.display = "none";

    songs.forEach((song, idx) => {
        const tr = document.createElement("tr");

        const tdIndex = document.createElement("td");
        tdIndex.textContent = idx + 1;
        tr.appendChild(tdIndex);

        const tdTitle = document.createElement("td");
        tdTitle.textContent = song.title || "";
        tdTitle.classList.add("title-link");
        tdTitle.addEventListener("click", () => showSongDetail(song));
        tr.appendChild(tdTitle);

        const tdArtist = document.createElement("td");
        tdArtist.textContent = song.artist || "";
        tr.appendChild(tdArtist);

        const tdDate = document.createElement("td");
        tdDate.textContent = song.date || "";
        tr.appendChild(tdDate);

        displayTbody.appendChild(tr);
    });
}

function renderCommentTable() {
    commentTbody.innerHTML = "";
    sortSongsByDate();

    if (songs.length === 0) {
        commentEmpty.style.display = "block";
        return;
    }
    commentEmpty.style.display = "none";

    songs.forEach((song, idx) => {
        const tr = document.createElement("tr");

        const tdIndex = document.createElement("td");
        tdIndex.textContent = idx + 1;
        tr.appendChild(tdIndex);

        const tdTitle = document.createElement("td");
        tdTitle.textContent = song.title || "";
        tdTitle.classList.add("title-link");
        tdTitle.addEventListener("click", () => showSongDetail(song));
        tr.appendChild(tdTitle);

        const tdArtist = document.createElement("td");
        tdArtist.textContent = song.artist || "";
        tr.appendChild(tdArtist);

        const tdAction = document.createElement("td");
        const btn = document.createElement("button");
        btn.textContent = "追加评论";
        btn.className = "action-btn";
        btn.addEventListener("click", () => onCommentSong(song.id));
        tdAction.appendChild(btn);
        tr.appendChild(tdAction);

        commentTbody.appendChild(tr);
    });
}

function renderDeleteTable() {
    deleteTbody.innerHTML = "";
    sortSongsByDate();

    if (songs.length === 0) {
        deleteEmpty.style.display = "block";
        return;
    }
    deleteEmpty.style.display = "none";

    songs.forEach((song, idx) => {
        const tr = document.createElement("tr");

        const tdIndex = document.createElement("td");
        tdIndex.textContent = idx + 1;
        tr.appendChild(tdIndex);

        const tdTitle = document.createElement("td");
        tdTitle.textContent = song.title || "";
        tdTitle.classList.add("title-link");
        tdTitle.addEventListener("click", () => showSongDetail(song));
        tr.appendChild(tdTitle);

        const tdArtist = document.createElement("td");
        tdArtist.textContent = song.artist || "";
        tr.appendChild(tdArtist);

        const tdDate = document.createElement("td");
        tdDate.textContent = song.date || "";
        tr.appendChild(tdDate);

        const tdAction = document.createElement("td");
        const btn = document.createElement("button");
        btn.textContent = "删除";
        btn.className = "action-btn delete";
        btn.addEventListener("click", () => onDeleteSong(song.id));
        tdAction.appendChild(btn);
        tr.appendChild(tdAction);

        deleteTbody.appendChild(tr);
    });
}

/* ========= 业务逻辑 ========= */

// 单曲添加
function onAddSong(event) {
    event.preventDefault();

    const title = titleInput.value.trim();
    const artist = artistInput.value.trim();
    const date = dateInput.value;
    const scoreStr = scoreInput.value.trim();
    const comment = commentInput.value.trim();

    const score = scoreStr === "" ? null : Number(scoreStr);

    const res = addSongInternal(title, artist, date, score, comment);
    if (!res.ok) {
        alert(res.message || "添加失败，请检查输入。");
        return;
    }

    form.reset();
    alert("添加成功。");
}

// 追加评论 + 更新分数
function onCommentSong(id) {
    const song = songs.find(s => s.id === id);
    if (!song) return;

    const defaultScore = song.score != null ? String(song.score) : "";
    const scoreInputStr = prompt(
        "更新评分（1–10，留空则保持不变）：",
        defaultScore
    );
    if (scoreInputStr === null) return; // 取消

    let newScore = song.score;
    const trimmedScore = scoreInputStr.trim();
    if (trimmedScore !== "") {
        const n = Number(trimmedScore);
        if (Number.isNaN(n) || n < 1 || n > 10) {
            alert("评分必须在 1–10 之间。");
            return;
        }
        newScore = n;
    }

    const newComment = prompt(
        "输入要追加的评论（留空则不追加）：",
        ""
    );
    if (newComment === null) return;

    const c = newComment.trim();
    if (c !== "") {
        if (song.comment && song.comment.length > 0) {
            song.comment = song.comment + " | " + c;
        } else {
            song.comment = c;
        }
    }

    song.score = newScore;
    saveToStorage();
    renderCommentTable();
}

// 删除歌曲
function onDeleteSong(id) {
    const song = songs.find(s => s.id === id);
    if (!song) return;

    const ok = confirm(`确定删除 "${song.title}" - ${song.artist} 吗？`);
    if (!ok) return;

    songs = songs.filter(s => s.id !== id);
    saveToStorage();
    renderDeleteTable();
}

// 清空全部
function onClearAll() {
    if (songs.length === 0) {
        alert("当前没有任何歌曲。");
        return;
    }
    const ok = confirm("这将清空所有歌曲记录，确定继续吗？");
    if (!ok) return;

    songs = [];
    saveToStorage();
    renderDeleteTable();
}

// 批量导入（对应 importPlaylist）
function onBulkImport() {
    const text = bulkInput.value || "";
    if (text.trim() === "") {
        alert("请先在文本框中粘贴或输入歌单。");
        return;
    }

    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);
    const dateStr = prompt(
        "请输入该歌单的日期（YYYY-MM-DD）：",
        todayStr
    );
    if (dateStr === null) return;

    const date = (dateStr || "").trim();
    if (!isValidDate(date)) {
        alert("日期格式错误，应为 YYYY-MM-DD。");
        return;
    }

    const lines = text.split(/\r?\n/);
    let okCount = 0;
    let failCount = 0;
    const failedLines = [];

    lines.forEach((line, idx) => {
        const s = line.trim();
        if (!s) return;

        const parts = s.split("-", 2);
        if (parts.length < 2) {
            failCount++;
            failedLines.push(`第 ${idx + 1} 行: "${s}"（格式错误，应为“歌名 - 歌手”）`);
            return;
        }

        const title = parts[0].trim();
        const artist = parts[1].trim();

        const res = addSongInternal(title, artist, date, null, "");
        if (res.ok) {
            okCount++;
        } else {
            failCount++;
            failedLines.push(
                `第 ${idx + 1} 行: "${s}"（${res.message || "重复或无效"}）`
            );
        }
    });

    let resultText =
        `导入完成。\n成功：${okCount} 首\n失败：${failCount} 首`;
    if (failedLines.length > 0) {
        resultText += "\n\n失败行：\n" + failedLines.join("\n");
    }

    bulkResult.innerText = resultText;
    alert(resultText);
}

// 批量清空文本
function onBulkClear() {
    bulkInput.value = "";
    bulkResult.textContent = "";
}

/* ========= 初始化 ========= */

document.addEventListener("DOMContentLoaded", () => {
    loadFromStorage();

    // 主菜单
    btnHomeAdd.addEventListener("click", () => {
        setAddMode("single");
        showScreen("add");
    });
    btnHomeComment.addEventListener("click", () => showScreen("comment"));
    btnHomeDisplay.addEventListener("click", () => showScreen("display"));
    btnHomeDelete.addEventListener("click", () => showScreen("delete"));

    // 返回按钮
    document.querySelectorAll("[data-back]").forEach(btn => {
        btn.addEventListener("click", () => showScreen("home"));
    });

    // Add 模式按钮
    btnAddSingleMode.addEventListener("click", () => setAddMode("single"));
    btnAddBulkMode.addEventListener("click", () => setAddMode("bulk"));

    // 单曲表单
    form.addEventListener("submit", onAddSong);

    // 批量导入
    btnBulkImport.addEventListener("click", onBulkImport);
    btnBulkClear.addEventListener("click", onBulkClear);

    // 清空全部
    btnClearAll.addEventListener("click", onClearAll);
});
