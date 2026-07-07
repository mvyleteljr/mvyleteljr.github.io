(function () {
  var apiBase = window.CHALLENGE_API_BASE || "/api/challenge";
  var tokenKey = "positiveMonitorToken";
  var selectedDay = 1;
  var state = null;

  var gate = document.getElementById("gate");
  var challenge = document.getElementById("challenge");
  var loginForm = document.getElementById("login-form");
  var loginName = document.getElementById("login-name");
  var loginPasscode = document.getElementById("login-passcode");
  var loginError = document.getElementById("login-error");
  var logoutButton = document.getElementById("logout-button");
  var statusEl = document.getElementById("challenge-status");
  var meterFill = document.getElementById("challenge-meter-fill");
  var dayList = document.getElementById("day-list");
  var selectedDayTitle = document.getElementById("selected-day-title");
  var selectedDayStatus = document.getElementById("selected-day-status");
  var entryForm = document.getElementById("entry-form");
  var entryBody = document.getElementById("entry-body");
  var entryFiles = document.getElementById("entry-files");
  var entryLink = document.getElementById("entry-link");
  var pendingMedia = document.getElementById("pending-media");
  var entryError = document.getElementById("entry-error");
  var entriesEl = document.getElementById("entries");

  function token() {
    return localStorage.getItem(tokenKey);
  }

  function setToken(value) {
    if (value) localStorage.setItem(tokenKey, value);
    else localStorage.removeItem(tokenKey);
  }

  function showMessage(el, message) {
    el.textContent = message || "";
    el.hidden = !message;
  }

  function request(action, options) {
    options = options || {};
    var headers = options.headers || {};
    headers["Content-Type"] = "application/json";
    if (token()) headers.Authorization = "Bearer " + token();

    return fetch(apiBase + "?action=" + encodeURIComponent(action), {
      method: options.method || "GET",
      headers: headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function (response) {
      return response.json().catch(function () {
        return {};
      }).then(function (payload) {
        if (!response.ok) throw new Error(payload.error || "request failed");
        return payload;
      });
    });
  }

  function mediaLabel(media) {
    if (media.kind === "url") return media.url;
    return media.name || media.type || "file";
  }

  function renderMedia(items, parent) {
    (items || []).forEach(function (item) {
      var wrap = document.createElement("div");
      wrap.className = "challenge-media";

      if (item.kind === "file" && item.dataUrl && /^image\//.test(item.type || "")) {
        var img = document.createElement("img");
        img.src = item.dataUrl;
        img.alt = item.name || "";
        wrap.appendChild(img);
      } else if (item.kind === "file" && item.dataUrl && /^video\//.test(item.type || "")) {
        var video = document.createElement("video");
        video.controls = true;
        video.src = item.dataUrl;
        wrap.appendChild(video);
      } else if (item.kind === "file" && item.dataUrl && /^audio\//.test(item.type || "")) {
        var audio = document.createElement("audio");
        audio.controls = true;
        audio.src = item.dataUrl;
        wrap.appendChild(audio);
      } else {
        var link = document.createElement("a");
        link.href = item.kind === "url" ? item.url : item.dataUrl;
        link.textContent = mediaLabel(item);
        link.target = "_blank";
        link.rel = "noreferrer";
        if (item.kind === "file") link.download = item.name || "file";
        wrap.appendChild(link);
      }

      parent.appendChild(wrap);
    });
  }

  function renderEntries() {
    entriesEl.replaceChildren();
    var entries = (state.entries || []).filter(function (entry) {
      return entry.day === selectedDay;
    });

    if (!entries.length) {
      var empty = document.createElement("p");
      empty.className = "muted";
      empty.textContent = "No entries.";
      entriesEl.appendChild(empty);
      return;
    }

    entries.forEach(function (entry) {
      var article = document.createElement("article");
      article.className = "challenge-entry";

      var meta = document.createElement("p");
      meta.className = "challenge-entry-meta";
      meta.textContent = entry.author + " - " + new Date(entry.created_at).toLocaleString();
      article.appendChild(meta);

      if (entry.body) {
        var body = document.createElement("p");
        body.textContent = entry.body;
        article.appendChild(body);
      }

      renderMedia(entry.media, article);
      entriesEl.appendChild(article);
    });
  }

  function renderDays() {
    dayList.replaceChildren();
    for (var day = 1; day <= 30; day += 1) {
      var item = document.createElement("li");
      var button = document.createElement("button");
      button.type = "button";
      button.textContent = String(day);
      button.dataset.day = String(day);
      if (day === selectedDay) button.className = "here";
      if (state.currentDay && day < state.currentDay) button.title = "locked";
      if (state.currentDay && day === state.currentDay) button.title = "today";
      if (!state.currentDay || day > state.currentDay) button.disabled = true;
      button.addEventListener("click", function (event) {
        selectedDay = Number(event.currentTarget.dataset.day);
        render();
      });
      item.appendChild(button);
      dayList.appendChild(item);
    }
  }

  function render() {
    if (!state) return;

    var activeDay = state.currentDay >= 1 && state.currentDay <= 30 ? state.currentDay : null;
    if (selectedDay < 1 || selectedDay > 30 || (activeDay && selectedDay > activeDay)) {
      selectedDay = activeDay || 1;
    }

    gate.hidden = true;
    challenge.hidden = false;

    var completed = Math.max(0, Math.min(30, state.currentDay || 0));
    var remaining = Math.max(0, 30 - completed);
    statusEl.textContent = "day " + completed + " of 30 - " + remaining + " left";
    meterFill.style.width = String((completed / 30) * 100) + "%";

    selectedDayTitle.textContent = "day " + selectedDay;
    if (activeDay === selectedDay) {
      selectedDayStatus.textContent = "open";
      entryForm.hidden = false;
    } else {
      selectedDayStatus.textContent = selectedDay < (state.currentDay || 0) ? "locked" : "not open";
      entryForm.hidden = true;
    }

    renderDays();
    renderEntries();
  }

  function fileToMedia(file) {
    return new Promise(function (resolve, reject) {
      if (file.size > 2500000) {
        reject(new Error(file.name + " is over 2.5 MB"));
        return;
      }

      var reader = new FileReader();
      reader.onload = function () {
        resolve({
          kind: "file",
          name: file.name,
          type: file.type || "application/octet-stream",
          dataUrl: reader.result
        });
      };
      reader.onerror = function () {
        reject(new Error("could not read " + file.name));
      };
      reader.readAsDataURL(file);
    });
  }

  function updatePending() {
    pendingMedia.replaceChildren();
    Array.prototype.forEach.call(entryFiles.files || [], function (file) {
      var item = document.createElement("span");
      item.textContent = file.name;
      pendingMedia.appendChild(item);
    });
  }

  function loadEntries() {
    return request("entries").then(function (payload) {
      state = payload;
      selectedDay = state.currentDay >= 1 && state.currentDay <= 30 ? state.currentDay : 1;
      render();
    }).catch(function () {
      setToken(null);
      gate.hidden = false;
      challenge.hidden = true;
    });
  }

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();
    showMessage(loginError, "");
    request("login", {
      method: "POST",
      body: {
        name: loginName.value,
        passcode: loginPasscode.value
      }
    }).then(function (payload) {
      setToken(payload.token);
      loginPasscode.value = "";
      return loadEntries();
    }).catch(function (error) {
      showMessage(loginError, error.message);
    });
  });

  logoutButton.addEventListener("click", function () {
    setToken(null);
    state = null;
    challenge.hidden = true;
    gate.hidden = false;
  });

  entryFiles.addEventListener("change", updatePending);

  entryForm.addEventListener("submit", function (event) {
    event.preventDefault();
    showMessage(entryError, "");

    var body = entryBody.value.trim();
    var link = entryLink.value.trim();
    var media = [];

    if (link) media.push({ kind: "url", url: link });

    Promise.all(Array.prototype.map.call(entryFiles.files || [], fileToMedia)).then(function (files) {
      media = media.concat(files);
      if (!body && !media.length) throw new Error("write something or add media");

      return request("entries", {
        method: "POST",
        body: { body: body, media: media }
      });
    }).then(function (payload) {
      state = payload;
      entryBody.value = "";
      entryLink.value = "";
      entryFiles.value = "";
      updatePending();
      render();
    }).catch(function (error) {
      showMessage(entryError, error.message);
    });
  });

  if (token()) loadEntries();
})();
