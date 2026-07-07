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
    var names = (state.participants || []).slice();

    entries.forEach(function (entry) {
      if (!names.some(function (name) {
        return name.toLowerCase() === entry.author.toLowerCase();
      })) {
        names.push(entry.author);
      }
    });

    if (!names.length && state.user) names.push(state.user.name);

    names.forEach(function (name) {
      var section = document.createElement("section");
      section.className = "challenge-person";

      var heading = document.createElement("h3");
      heading.textContent = name;
      section.appendChild(heading);

      var personEntries = entries.filter(function (entry) {
        return entry.author.toLowerCase() === name.toLowerCase();
      });

      if (!personEntries.length) {
        var empty = document.createElement("p");
        empty.className = "muted";
        empty.textContent = "No entries.";
        section.appendChild(empty);
      } else {
        personEntries.forEach(function (entry) {
          renderEntry(entry, section);
        });
      }

      entriesEl.appendChild(section);
    });
  }

  function renderEntry(entry, parent) {
    var article = document.createElement("article");
    article.className = "challenge-entry";

    var meta = document.createElement("p");
    meta.className = "challenge-entry-meta";
    meta.textContent = new Date(entry.created_at).toLocaleString();
    article.appendChild(meta);

    if (entry.body) {
      var body = document.createElement("p");
      body.textContent = entry.body;
      article.appendChild(body);
    }

    renderMedia(entry.media, article);
    renderEntryActions(entry, article);
    parent.appendChild(article);
  }

  function canEditEntry(entry) {
    return state &&
      state.user &&
      entry.author.toLowerCase() === state.user.name.toLowerCase() &&
      state.currentDay >= 1 &&
      state.currentDay <= 30 &&
      selectedDay === state.currentDay &&
      entry.day === state.currentDay;
  }

  function renderEntryActions(entry, article) {
    if (!canEditEntry(entry)) return;

    var actions = document.createElement("div");
    actions.className = "challenge-entry-actions";

    var edit = document.createElement("button");
    edit.type = "button";
    edit.textContent = "edit";
    edit.addEventListener("click", function () {
      renderEditForm(entry, article);
    });

    actions.appendChild(edit);
    article.appendChild(actions);
  }

  function renderEditForm(entry, article) {
    var existing = article.querySelector(".challenge-edit-form");
    if (existing) existing.remove();

    var form = document.createElement("form");
    form.className = "challenge-entry-form challenge-edit-form";

    var bodyLabel = document.createElement("label");
    bodyLabel.textContent = "anecdote";
    var bodyInput = document.createElement("textarea");
    bodyInput.rows = 5;
    bodyInput.value = entry.body || "";
    bodyLabel.appendChild(bodyInput);

    var keepLabel = document.createElement("label");
    keepLabel.className = "challenge-keep-media";
    var keepInput = document.createElement("input");
    keepInput.type = "checkbox";
    keepInput.checked = true;
    keepInput.className = "challenge-checkbox";
    keepLabel.appendChild(keepInput);
    keepLabel.appendChild(document.createTextNode(" keep media"));

    var fileLabel = document.createElement("label");
    fileLabel.textContent = "add media";
    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.multiple = true;
    fileLabel.appendChild(fileInput);

    var linkLabel = document.createElement("label");
    linkLabel.textContent = "add link";
    var linkInput = document.createElement("input");
    linkInput.type = "url";
    linkInput.placeholder = "https://...";
    linkLabel.appendChild(linkInput);

    var pending = document.createElement("div");
    pending.className = "challenge-pending";

    var buttons = document.createElement("div");
    buttons.className = "challenge-edit-buttons";
    var save = document.createElement("button");
    save.type = "submit";
    save.textContent = "save";
    var cancel = document.createElement("button");
    cancel.type = "button";
    cancel.textContent = "cancel";
    cancel.addEventListener("click", function () {
      form.remove();
    });
    buttons.appendChild(save);
    buttons.appendChild(cancel);

    fileInput.addEventListener("change", function () {
      pending.replaceChildren();
      Array.prototype.forEach.call(fileInput.files || [], function (file) {
        var item = document.createElement("span");
        item.textContent = file.name;
        pending.appendChild(item);
      });
    });

    form.appendChild(bodyLabel);
    form.appendChild(keepLabel);
    form.appendChild(fileLabel);
    form.appendChild(linkLabel);
    form.appendChild(pending);
    form.appendChild(buttons);

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      showMessage(entryError, "");

      var body = bodyInput.value.trim();
      var link = linkInput.value.trim();
      var media = keepInput.checked ? (entry.media || []).slice() : [];

      if (link) media.push({ kind: "url", url: link });

      Promise.all(Array.prototype.map.call(fileInput.files || [], fileToMedia)).then(function (files) {
        media = media.concat(files);
        if (!body && !media.length) throw new Error("write something or add media");

        return request("entry", {
          method: "PUT",
          body: { id: entry.id, body: body, media: media }
        });
      }).then(function (payload) {
        state = payload;
        render();
      }).catch(function (error) {
        showMessage(entryError, error.message);
      });
    });

    article.appendChild(form);
    bodyInput.focus();
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
