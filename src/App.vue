<template>
  <div class="app-shell" :data-theme="resolvedTheme">
    <header class="topbar">
      <div class="brand-group">
        <img src="/logo.svg" alt="" class="brand-logo" />
        <div class="brand-copy">
          <strong>SakuraTH <span>GeoIP2Route</span></strong>
          <small>{{ t('brandNote') }}</small>
        </div>
        <span class="version">V1.8.0</span>
      </div>
      <div class="header-workspace-tools">
        <div class="header-mode-switch" role="tablist" :aria-label="t('workspaceMode')">
          <button type="button" role="tab" :aria-selected="appMode === 'compare'" :class="{ active: appMode === 'compare' }" @click="appMode = 'compare'">
            <svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="8" cy="9" r="4"/><circle cx="24" cy="23" r="4"/><path d="M12 9h10l-3-3m3 3-3 3M20 23H10l3-3m-3 3 3 3"/></svg><span>{{ t('ipCompare') }}</span>
          </button>
          <button type="button" role="tab" :aria-selected="appMode === 'ranking'" :class="{ active: appMode === 'ranking' }" @click="appMode = 'ranking'">
            <svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="5" width="15" height="6" rx="2"/><rect x="5" y="13" width="15" height="6" rx="2"/><rect x="5" y="21" width="15" height="6" rx="2"/><path d="M24 8h3m-3 8h3m-3 8h3M9 8h.1M9 16h.1M9 24h.1"/></svg><span>{{ t('serverRanking') }}</span>
          </button>
        </div>
        <div class="header-jump-menu" @focusout="closeHeaderJumpOnFocusOut" @keydown.esc.stop.prevent="headerJumpOpen = false">
          <button class="header-jump-trigger" type="button" aria-controls="header-jump-panel" :aria-expanded="headerJumpOpen" @click="headerJumpOpen = !headerJumpOpen">
            <span>{{ t('sections') }}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 9 5 5 5-5"/></svg>
          </button>
          <nav v-if="headerJumpOpen" id="header-jump-panel" class="header-jump-panel sidebar-jump-nav" :aria-label="t('quickNavigation')">
            <p>{{ t('jumpTo') }}</p>
            <div class="sidebar-jump-list">
              <button type="button" :class="{ active: sidebarJumpTarget === 'current' }" :aria-current="sidebarJumpTarget === 'current' ? 'location' : undefined" @click="jumpToSidebar('current')"><i aria-hidden="true"></i><span>{{ t('addCurrentIp') }}</span></button>
              <button type="button" :class="{ active: sidebarJumpTarget === 'update' }" :aria-current="sidebarJumpTarget === 'update' ? 'location' : undefined" @click="jumpToSidebar('update')"><i aria-hidden="true"></i><span>{{ t('updateFromIp2Location') }}</span></button>
              <button type="button" :class="{ active: sidebarJumpTarget === 'add' }" :aria-current="sidebarJumpTarget === 'add' ? 'location' : undefined" @click="jumpToSidebar('add')"><i aria-hidden="true"></i><span>{{ t('addIpToList') }}</span></button>
              <button type="button" :class="{ active: sidebarJumpTarget === 'points' }" :aria-current="sidebarJumpTarget === 'points' ? 'location' : undefined" @click="jumpToSidebar('points')"><i aria-hidden="true"></i><span>{{ appMode === 'ranking' ? t('allIpPoints') : t('mapPoints') }}</span></button>
              <button type="button" :class="{ active: sidebarJumpTarget === 'demo' }" :aria-current="sidebarJumpTarget === 'demo' ? 'location' : undefined" @click="jumpToSidebar('demo')"><i aria-hidden="true"></i><span>{{ t('demoTools') }}</span></button>
            </div>
          </nav>
        </div>
      </div>
      <div class="header-status contest-header-status" :aria-label="`${clockReferenceLabel}. ${currentDateTime}`" :title="clockReferenceLabel">
        <div class="contest-header-time">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/></svg>
          <time :datetime="now.toISOString()" :aria-label="currentDateTime">
            <span class="contest-header-date">{{ currentDateTimeParts.date }}</span>
            <span class="contest-header-year">
              <template v-if="language === 'th'"><small class="contest-header-era">{{ currentDateTimeParts.era }}</small><b>{{ currentDateTimeParts.year }}</b></template>
              <template v-else><b>{{ currentDateTimeParts.year }}</b><small class="contest-header-era">{{ currentDateTimeParts.era }}</small></template>
            </span>
            <span class="contest-header-divider" aria-hidden="true"></span>
            <strong class="contest-header-clock">{{ currentDateTimeParts.time }}</strong>
            <small v-if="currentDateTimeParts.dayPeriod" class="contest-header-period">{{ currentDateTimeParts.dayPeriod }}</small>
            <span class="contest-header-zone"><b>{{ clockReferenceCode }}</b><i aria-hidden="true">·</i>{{ currentDateTimeParts.timeZone }}</span>
          </time>
        </div>
        <span class="contest-header-label">{{ t('contestEntry2026') }}</span>
      </div>
      <nav class="top-actions" :aria-label="language === 'th' ? 'ส่วนควบคุมแอปพลิเคชัน' : 'Application controls'">
        <button class="header-button text-button" type="button" @click="refreshComparePoints" :disabled="syncingCompare || addingCurrentIp || !compareRefreshTotal" :aria-label="t('refresh')" :title="t('refresh')">
          <svg class="button-icon refresh-icon" :class="{ spinning: syncingCompare }" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.25 12a8.25 8.25 0 1 1-2.42-5.83"/><path class="refresh-arrowhead" d="m21.3 9.1-7-.95 4.15-5.7Z"/></svg><span class="optional-label">{{ t('refresh') }}</span>
        </button>
        <button ref="helpTrigger" class="header-button icon-only-button" type="button" @click="openHelp" :aria-label="t('help')" :title="t('help')"><svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.7 9a2.5 2.5 0 1 1 3.2 2.4c-.9.4-1.4 1-1.4 2.1M12 17h.01"/></svg></button>
        <div class="language-slider" :class="{ thai: language === 'th' }" role="group" :aria-label="t('language')">
          <span class="language-slider-thumb" aria-hidden="true"></span>
          <button type="button" :class="{ active: language === 'en' }" :aria-pressed="language === 'en'" @click="language = 'en'">EN</button>
          <button type="button" :class="{ active: language === 'th' }" :aria-pressed="language === 'th'" @click="language = 'th'">TH</button>
        </div>
        <div class="theme-control" role="group" :aria-label="t('theme')">
          <button v-for="mode in ['light','dark','auto']" :key="mode" type="button" :class="{ active: themeMode === mode }" @click="themeMode = mode" :aria-label="themeActionLabel(mode)" :aria-pressed="themeMode === mode" :title="themeActionLabel(mode)">
            <svg class="button-icon theme-icon theme-icon-light" v-if="mode === 'light'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.75"/><path d="M12 2.5v2m0 15v2M2.5 12h2m15 0h2M4.6 4.6 6 6m12 12 1.4 1.4m0-14.8L18 6M6 18l-1.4 1.4"/></svg>
            <svg class="button-icon theme-icon theme-icon-dark" v-else-if="mode === 'dark'" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 15.2A8.7 8.7 0 0 1 8.8 3.3a8.8 8.8 0 1 0 11.9 11.9Z"/></svg>
            <svg class="button-icon theme-icon theme-icon-auto" v-else viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path class="theme-icon-fill" d="M12 3.5a8.5 8.5 0 0 1 0 17Z"/></svg>
          </button>
        </div>
        <button class="header-button mobile-theme-button" type="button" @click="cycleTheme" :title="themeActionLabel(themeMode)" :aria-label="themeActionLabel(themeMode)">
          <svg class="button-icon theme-icon theme-icon-light" v-if="themeMode === 'light'" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="3.75"/><path d="M12 2.5v2m0 15v2M2.5 12h2m15 0h2M4.6 4.6 6 6m12 12 1.4 1.4m0-14.8L18 6M6 18l-1.4 1.4"/></svg>
          <svg class="button-icon theme-icon theme-icon-dark" v-else-if="themeMode === 'dark'" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.7 15.2A8.7 8.7 0 0 1 8.8 3.3a8.8 8.8 0 1 0 11.9 11.9Z"/></svg>
          <svg class="button-icon theme-icon theme-icon-auto" v-else viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path class="theme-icon-fill" d="M12 3.5a8.5 8.5 0 0 1 0 17Z"/></svg>
        </button>
      </nav>
    </header>

    <main class="workspace" :class="{ 'console-open': consoleOpen }">
      <aside class="section-rail" :aria-label="t('quickNavigation')" @focusout="closeHeaderJumpOnFocusOut" @keydown.esc.stop.prevent="headerJumpOpen = false">
        <button class="section-rail-trigger" type="button" aria-controls="section-rail-panel" :aria-expanded="headerJumpOpen" :title="t('quickNavigation')" @click="headerJumpOpen = !headerJumpOpen">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h14"/><circle cx="8" cy="6" r="1"/><circle cx="8" cy="12" r="1"/><circle cx="8" cy="18" r="1"/></svg><span>{{ t('sections') }}</span>
        </button>
        <nav v-if="headerJumpOpen" id="section-rail-panel" class="section-rail-panel sidebar-jump-nav" :aria-label="t('quickNavigation')">
          <p>{{ t('jumpTo') }}</p>
          <div class="sidebar-jump-list">
            <button type="button" :class="{ active: sidebarJumpTarget === 'current' }" :aria-current="sidebarJumpTarget === 'current' ? 'location' : undefined" @click="jumpToSidebar('current')"><i aria-hidden="true"></i><span>{{ t('addCurrentIp') }}</span></button>
            <button type="button" :class="{ active: sidebarJumpTarget === 'update' }" :aria-current="sidebarJumpTarget === 'update' ? 'location' : undefined" @click="jumpToSidebar('update')"><i aria-hidden="true"></i><span>{{ t('updateFromIp2Location') }}</span></button>
            <button type="button" :class="{ active: sidebarJumpTarget === 'add' }" :aria-current="sidebarJumpTarget === 'add' ? 'location' : undefined" @click="jumpToSidebar('add')"><i aria-hidden="true"></i><span>{{ t('addIpToList') }}</span></button>
            <button type="button" :class="{ active: sidebarJumpTarget === 'points' }" :aria-current="sidebarJumpTarget === 'points' ? 'location' : undefined" @click="jumpToSidebar('points')"><i aria-hidden="true"></i><span>{{ appMode === 'ranking' ? t('allIpPoints') : t('mapPoints') }}</span></button>
            <button type="button" :class="{ active: sidebarJumpTarget === 'demo' }" :aria-current="sidebarJumpTarget === 'demo' ? 'location' : undefined" @click="jumpToSidebar('demo')"><i aria-hidden="true"></i><span>{{ t('demoTools') }}</span></button>
          </div>
        </nav>
      </aside>
      <MapCanvas
        :client="client"
        :mode="appMode"
        :compare-points="comparePoints"
        :selected-compare-ids="selectedCompareIds"
        :ranking-points="serverRanking"
        :ranking-source-id="rankingSourceId"
        :selected-server-id="selectedServerId"
        :theme="resolvedTheme"
        :labels="mapLabels"
        @select-compare="selectComparePoint"
        @select-server="selectedServerId = $event"
      />

      <aside ref="controlPanel" class="control-panel panel-card" @scroll.passive="updateSidebarJumpTarget">
        <div ref="sidebarStickyHeader" class="sidebar-sticky-header">
          <div class="mode-switch" role="tablist" :aria-label="t('workspaceMode')">
            <button type="button" role="tab" :aria-selected="appMode === 'compare'" :class="{ active: appMode === 'compare' }" @click="appMode = 'compare'">
              <span class="mode-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="8" cy="9" r="4"/><circle cx="24" cy="23" r="4"/><path d="M12 9h10l-3-3m3 3-3 3M20 23H10l3-3m-3 3 3 3"/></svg></span>
              <span><strong>{{ t('ipCompare') }}</strong><small>{{ t('compareMenuHint') }}</small></span>
            </button>
            <button type="button" role="tab" :aria-selected="appMode === 'ranking'" :class="{ active: appMode === 'ranking' }" @click="appMode = 'ranking'">
              <span class="mode-icon"><svg viewBox="0 0 32 32" aria-hidden="true"><rect x="5" y="5" width="15" height="6" rx="2"/><rect x="5" y="13" width="15" height="6" rx="2"/><rect x="5" y="21" width="15" height="6" rx="2"/><path d="M24 8h3m-3 8h3m-3 8h3M9 8h.1M9 16h.1M9 24h.1"/></svg></span>
              <span><strong>{{ t('serverRanking') }}</strong><small>{{ t('rankingMenuHint') }}</small></span>
            </button>
          </div>
          <nav class="sidebar-jump-nav" :aria-label="t('quickNavigation')">
            <p>{{ t('quickNavigation') }}</p>
            <div class="sidebar-jump-list">
              <button type="button" :class="{ active: sidebarJumpTarget === 'current' }" :aria-current="sidebarJumpTarget === 'current' ? 'location' : undefined" @click="jumpToSidebar('current')"><i aria-hidden="true"></i><span>{{ t('addCurrentIp') }}</span></button>
              <button type="button" :class="{ active: sidebarJumpTarget === 'update' }" :aria-current="sidebarJumpTarget === 'update' ? 'location' : undefined" @click="jumpToSidebar('update')"><i aria-hidden="true"></i><span>{{ t('updateFromIp2Location') }}</span></button>
              <button type="button" :class="{ active: sidebarJumpTarget === 'add' }" :aria-current="sidebarJumpTarget === 'add' ? 'location' : undefined" @click="jumpToSidebar('add')"><i aria-hidden="true"></i><span>{{ t('addIpToList') }}</span></button>
              <button type="button" :class="{ active: sidebarJumpTarget === 'points' }" :aria-current="sidebarJumpTarget === 'points' ? 'location' : undefined" @click="jumpToSidebar('points')"><i aria-hidden="true"></i><span>{{ appMode === 'ranking' ? t('allIpPoints') : t('mapPoints') }}</span></button>
              <button type="button" :class="{ active: sidebarJumpTarget === 'demo' }" :aria-current="sidebarJumpTarget === 'demo' ? 'location' : undefined" @click="jumpToSidebar('demo')"><i aria-hidden="true"></i><span>{{ t('demoTools') }}</span></button>
            </div>
          </nav>
        </div>

        <section ref="currentIpSection" class="panel-section current-ip-section" tabindex="-1">
          <button class="primary-modal-button current-ip-button" type="button" @click="addCurrentIp" :disabled="addingCurrentIp || syncingCompare || bulkLoading || addingComparePoint || measurementBusy" :aria-busy="addingCurrentIp">
            <span v-if="addingCurrentIp" class="api-spinner" aria-hidden="true"></span>
            <svg v-else viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>
            {{ t(addingCurrentIp ? 'detectingCurrentIp' : 'addCurrentIp') }}
          </button>
          <p class="current-ip-help">{{ t('currentIpHelp') }}</p>
          <p v-if="currentIpNotice" class="current-ip-notice" role="status">{{ currentIpNotice }}</p>
          <p v-if="currentIpError" class="form-error" role="alert">{{ currentIpError }}</p>
          <div v-if="apiWork" class="api-progress-panel" role="status" aria-live="polite">
            <div><span class="api-spinner" aria-hidden="true"></span><strong>{{ t('fetchingApi') }}</strong><span v-if="apiWork.total">{{ apiWork.completed }}/{{ apiWork.total }}</span></div>
            <progress v-if="apiWork.total" :value="apiWork.completed" :max="apiWork.total" :aria-label="t('fetchingApi')"></progress>
            <progress v-else :aria-label="t('fetchingApi')"></progress>
            <small>{{ t(apiWork.total ? 'apiProgressCount' : 'apiWaiting') }}</small>
          </div>
        </section>

        <template v-if="appMode === 'ranking'">
          <section ref="updateSection" class="panel-section ranking-intro" tabindex="-1">
            <div class="section-heading">
              <div><p class="kicker">{{ t('serverRanking') }}</p><h1>{{ t('rankAllServers') }}</h1></div>
              <span class="point-count">{{ serverRanking.length }}</span>
            </div>
            <p class="compare-description">{{ t('rankingIntro') }}</p>
            <IpSourcePicker v-model="rankingSourceId" :points="comparePoints.filter(p => rankingBasis !== 'demo' || p.demoGroup)" :disabled="measurementBusy || rankingBasis === 'demo'" :label="t('sourceIp')" :empty-label="t('chooseSource')" />
            <label class="source-selector">
              <span>{{ t('rankingBasis') }}</span>
              <select v-model="rankingBasis" :disabled="measurementBusy">
                <option value="geo">{{ t('geoBasis') }}</option>
                <option value="browser">{{ t('browserBasis') }}</option>
                <option v-if="comparePoints.some(point => point.demoGroup)" value="demo">{{ t('demoBasis') }}</option>
              </select>
            </label>
            <button class="sync-button" type="button" @click="refreshComparePoints" :disabled="syncingCompare || addingCurrentIp || !compareRefreshTotal">
              <svg class="button-icon refresh-icon" :class="{ spinning: syncingCompare }" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.25 12a8.25 8.25 0 1 1-2.42-5.83"/><path class="refresh-arrowhead" d="m21.3 9.1-7-.95 4.15-5.7Z"/></svg>
              {{ syncingCompare ? `${t('updating')} ${compareProgress}/${compareRefreshTotal}` : t('updateFromIp2Location') }}
            </button>
            <button class="measure-button" type="button" @click="measureAllProbes" :disabled="measurementBusy || syncingCompare || addingCurrentIp || !probeCount">
              <svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12h3l2-6 4 12 3-8 2 2h4"/></svg>
              {{ measuringAll ? `${t('measuringLatency')} ${measureProgress}/${measureTotal}` : `${t('measureAvailable')} (${probeCount})` }}
            </button>
            <small class="sync-note">{{ t('rankingFormulaHint') }}</small>
            <p v-if="rankingBasis !== 'geo'" class="evidence-banner">{{ t(rankingBasis === 'demo' ? 'demoNotice' : 'browserNotice') }}</p>
          </section>

          <section ref="addIpSection" class="panel-section compare-add-section" tabindex="-1">
            <p class="kicker">{{ t('addIpToList') }}</p>
            <form class="compare-add-form" @submit.prevent="addComparePoint">
              <WrappingInput v-model.trim="compareTarget" :placeholder="t('ipPlaceholder')" :aria-label="t('addIpToList')" @submit="addComparePoint" />
              <button class="icon-only-button add-ip-button" type="submit" :disabled="addingComparePoint || addingCurrentIp" :aria-label="t('addIpToList')" :title="t('addIpToList')"><span v-if="addingComparePoint" class="api-spinner" aria-hidden="true"></span><svg v-else class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
            </form>
            <div class="bulk-actions">
              <button type="button" @click="openBulk"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h11v14H8zM5 8H3v13h11v-2"/></svg>{{ t('pasteList') }}</button>
              <button type="button" @click="openCsvPicker"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM4 10h16M10 4v16"/></svg>{{ t('importCsv') }}</button>
            </div>
          </section>

          <section ref="mapPointsSection" class="panel-section compare-list-section" tabindex="-1">
            <div class="section-title-row"><div><p class="kicker">{{ t('allIpPoints') }}</p><h2>{{ t('chooseSource') }}</h2></div><span class="list-count">{{ comparePoints.length }}</span></div>
            <div class="point-list-actions single-action">
              <button class="delete-all-button" type="button" :disabled="pointListBusy || !comparePoints.length" :aria-label="t('deleteAllPoints')" :title="t('deleteAllPoints')" @click="openDeleteAll">
                <svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"/></svg><span>{{ t('deleteAllPoints') }}</span>
              </button>
            </div>
            <div v-if="comparePoints.length" class="compare-point-list">
              <div v-for="point in comparePoints" :key="point.id" :class="['compare-point-row', { selected: rankingSourceId === point.id }]">
                <button class="compare-point-select" type="button" :disabled="measurementBusy || rankingBasis === 'demo'" @click="rankingSourceId = point.id">
                  <span :class="['compare-marker', { 'ranking-source': rankingSourceId === point.id }]">{{ rankingSourceId === point.id ? 'SRC' : (serverRankFor(point.id)?.rank || '—') }}</span>
                  <span class="compare-point-copy"><strong>{{ flagEmoji(point.country_code) }} {{ point.city_name || point.country_name }}</strong><small><span class="point-ip ip-text">{{ point.ip }}</span><span class="point-network">{{ point.isp || point.asn || '—' }}</span></small></span>
                  <span class="source-chip">{{ point.demoGroup ? t('simulated') : point.source === 'ip2location' ? t('liveBadge') : t('sampleBadge') }}</span>
                </button>
                <button class="compare-delete-button" type="button" :disabled="pointListBusy" :aria-label="`${t('deleteIp')} ${point.ip}`" :title="t('deleteIp')" @click="openDeletePoint(point.id)"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"/></svg></button>
              </div>
            </div>
            <div v-else class="point-list-empty" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2"/><path d="m4 4 16 16"/></svg><strong>{{ t('emptyPointList') }}</strong><p>{{ t('emptyPointListHint') }}</p></div>
          </section>
        </template>

        <template v-else>
          <section ref="updateSection" class="panel-section compare-intro" tabindex="-1">
            <div class="section-heading">
              <div><p class="kicker">{{ t('ipMap') }}</p><h1>{{ t('compareAnyTwo') }}</h1></div>
              <span class="point-count">{{ comparePoints.length }}</span>
            </div>
            <p class="compare-description">{{ t('compareIntro') }}</p>
            <button class="sync-button" type="button" @click="refreshComparePoints" :disabled="syncingCompare || addingCurrentIp || !compareRefreshTotal">
              <svg class="button-icon refresh-icon" :class="{ spinning: syncingCompare }" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.25 12a8.25 8.25 0 1 1-2.42-5.83"/><path class="refresh-arrowhead" d="m21.3 9.1-7-.95 4.15-5.7Z"/></svg>
              {{ syncingCompare ? `${t('updating')} ${compareProgress}/${compareRefreshTotal}` : t('updateFromIp2Location') }}
            </button>
            <small class="sync-note">{{ compareSourceNote }}</small>
          </section>

          <section ref="addIpSection" class="panel-section compare-add-section" tabindex="-1">
            <p class="kicker">{{ t('addIpToList') }}</p>
            <form class="compare-add-form" @submit.prevent="addComparePoint">
              <WrappingInput v-model.trim="compareTarget" :placeholder="t('ipPlaceholder')" :aria-label="t('addIpToList')" @submit="addComparePoint" />
              <button class="icon-only-button add-ip-button" type="submit" :disabled="addingComparePoint || addingCurrentIp" :aria-label="t('addIpToList')" :title="t('addIpToList')"><span v-if="addingComparePoint" class="api-spinner" aria-hidden="true"></span><svg v-else class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button>
            </form>
            <div class="bulk-actions">
              <button type="button" @click="openBulk"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5h11v14H8zM5 8H3v13h11v-2"/></svg>{{ t('pasteList') }}</button>
              <button type="button" @click="openCsvPicker"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16v16H4zM4 10h16M10 4v16"/></svg>{{ t('importCsv') }}</button>
            </div>
          </section>

          <section ref="mapPointsSection" class="panel-section compare-list-section" tabindex="-1">
            <div class="section-title-row"><div><p class="kicker">{{ t('mapPoints') }}</p><h2>{{ t('selectTwoPoints') }}</h2></div><span class="list-count">{{ comparePoints.length }}</span></div>
            <div class="point-list-actions">
              <button class="clear-compare-button" type="button" @click="clearCompareSelection" :disabled="!selectedCompareIds.length" :aria-label="t('clearPointSelection')" :title="t('clearPointSelection')"><svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m16 3 5 5-10 10H6l-3-3L16 3Z"/><path d="m12 7 5 5M10 18h11"/></svg><span>{{ t('clearPointSelection') }}</span></button>
              <button class="delete-all-button" type="button" :disabled="pointListBusy || !comparePoints.length" :aria-label="t('deleteAllPoints')" :title="t('deleteAllPoints')" @click="openDeleteAll"><svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"/></svg><span>{{ t('deleteAllPoints') }}</span></button>
            </div>
            <div v-if="comparePoints.length" class="compare-point-list">
              <div v-for="(point, index) in comparePoints" :key="point.id" :class="['compare-point-row', { selected: selectedCompareIds.includes(point.id) }]">
                <button class="compare-point-select" type="button" @click="selectComparePoint(point.id)">
                  <span :class="['compare-marker', compareMarkerClass(point.id)]">{{ compareMarkerLabel(point.id, index) }}</span>
                  <span class="compare-point-copy">
                    <strong>{{ flagEmoji(point.country_code) }} {{ point.city_name || point.country_name }}</strong>
                    <small><span class="point-ip ip-text">{{ point.ip }}</span><span class="point-network">{{ point.isp || point.asn || '—' }}</span></small>
                  </span>
                  <span class="source-chip">{{ point.source === 'ip2location' ? t('liveBadge') : t('sampleBadge') }}</span>
                </button>
                <button class="compare-delete-button" type="button" :disabled="pointListBusy" :aria-label="`${t('deleteIp')} ${point.ip}`" :title="t('deleteIp')" @click="openDeletePoint(point.id)">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"/></svg>
                </button>
              </div>
            </div>
            <div v-else class="point-list-empty" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-5.1 7-12a7 7 0 1 0-14 0c0 6.9 7 12 7 12Z"/><circle cx="12" cy="9" r="2"/><path d="m4 4 16 16"/></svg><strong>{{ t('emptyPointList') }}</strong><p>{{ t('emptyPointListHint') }}</p></div>
          </section>
        </template>

        <div ref="demoSection" class="demo-launcher" tabindex="-1">
          <button type="button" @click="loadRankingDemo" :disabled="measurementBusy || syncingCompare || addingCurrentIp" aria-describedby="demo-launcher-hint">{{ t('tryRankingDemo') }}</button>
          <p id="demo-launcher-hint" class="launcher-note">{{ t('demoLauncherHint') }}</p>
          <button type="button" @click="loadProbeExample" aria-describedby="live-launcher-hint">{{ t('loadProbeExample') }}</button>
          <p id="live-launcher-hint" class="launcher-note">{{ t('liveLauncherHint') }}</p>
        </div>
      </aside>

      <aside ref="resultPanel" class="result-panel panel-card" tabindex="-1" :aria-label="appMode === 'ranking' ? t('recommendedServer') : t('ipComparison')">
        <template v-if="appMode === 'ranking'">
          <section v-if="bestServer && !measurementBusy" class="recommendation server-recommendation">
            <div class="recommendation-head"><p class="kicker">{{ t('recommendedServer') }}</p><span class="recommendation-badge"><i></i>{{ t('bestRouteMatch') }}</span></div>
            <h2>{{ flagEmoji(bestServer.country_code) }} {{ bestServer.city_name || bestServer.country_name }}</h2>
            <p class="host"><span class="ip-text">{{ bestServer.ip }}</span><span>{{ bestServer.isp || bestServer.asn || '—' }}</span></p>
            <div class="score-row">
              <div class="score-orbit" :style="{ '--score': `${bestServer.score * 3.6}deg` }"><span><strong>{{ Math.round(bestServer.score) }}</strong><small>/100</small></span></div>
              <div class="score-copy"><strong>{{ t(serverScoreLabel(bestServer.score)) }}</strong><span>{{ t('routeScore') }}</span><small>{{ t('routeScoreExplanation') }}</small></div>
            </div>
            <div class="metric-grid">
              <div><span>{{ t('latency') }}</span><strong>{{ formatLatency(bestServer) }}</strong><em>{{ t(rankingBasis === 'demo' ? 'simulated' : bestServer.measurement?.kind === 'browser' ? 'browserMeasured' : 'notTested') }}</em></div>
              <div><span>{{ t('distance') }}</span><strong>{{ formatDistance(bestServer.distance) }}</strong><em>{{ t('fromSource') }}</em></div>
              <div><span>{{ t('network') }}</span><strong>{{ bestServer.usage_type || '—' }}</strong><em>{{ t('usageType') }}</em></div>
              <div><span>{{ t('confidence') }}</span><strong>{{ t(rankingBasis === 'geo' ? 'estimated' : rankingBasis === 'demo' ? 'simulated' : 'measured') }}</strong><em>{{ rankingBasis === 'geo' ? t('geoBasis') : `${t('sampleRequests')}: ${bestServer.measurement.successful}/${bestServer.measurement.attempts}` }}</em></div>
            </div>
            <div class="score-breakdown">
              <p>{{ t('scoreDetails') }}</p>
              <div v-for="component in bestServer.components" :key="component.key"><span>{{ t(component.key) }} <b>{{ component.weight * 100 }}%</b></span><i><em :style="{ width: `${component.value}%` }"></em></i><strong>{{ component.contribution.toFixed(1) }}</strong></div>
            </div>
            <div class="why-winner"><span>✓</span><div><strong>{{ t('whyThisServer') }}</strong><p>{{ scoreReason(bestServer) }}</p></div></div>
            <p v-if="rankingBasis === 'demo' && geoWinner && geoWinner.id !== bestServer.id" class="evidence-banner">{{ t('geoBasis') }}: {{ geoWinner.city_name }} · {{ t('demoBasis') }}: {{ bestServer.city_name }}</p>
          </section>

          <p v-if="measurementBusy" class="evidence-banner" role="status">{{ t('measuringLatency') }} {{ measuringAll ? `${measureProgress}/${measureTotal}` : '' }}</p>
          <section v-if="!bestServer && serverRanking.length && !measurementBusy" class="evidence-banner"><strong>{{ t('noMeasuredCandidates') }}</strong><p>{{ t('noMeasuredHint') }}</p></section>

          <section v-if="serverRanking.length" class="ranking-section server-ranking-section">
            <div class="section-title-row"><div><p class="kicker">{{ t('serverRanking') }}</p><h2>{{ t('allAvailableServers') }}</h2></div><span class="ranking-source-chip">SRC · {{ rankingSource?.country_code || '—' }}</span></div>
            <div class="ranking-table">
              <button v-for="server in serverRanking" :key="server.id" type="button" :class="['ranking-row server-row', { selected: selectedServerId === server.id }]" @click="selectedServerId = server.id">
                <span class="rank">{{ server.rank ? `#${server.rank}` : '—' }}</span>
                <span class="endpoint-name"><strong>{{ server.city_name || server.country_name }}</strong><small><span class="ip-text">{{ server.ip }}</span><span>{{ server.country_code }}</span></small></span>
                <span class="mini-metric"><small>{{ t('latency') }}</small><b>{{ formatLatency(server) }}</b></span>
                <span class="mini-metric distance"><small>{{ t('distance') }}</small><b>{{ formatDistance(server.distance) }}</b></span>
                <span class="row-score" :title="server.eligible ? t('routeScore') : t('notRanked')">{{ server.eligible ? Math.round(server.score) : '—' }}</span>
              </button>
            </div>
          </section>

          <section v-if="selectedServer" class="selected-details server-details">
            <div><p class="kicker">{{ t('selectedServer') }}</p><h3>{{ selectedServer.city_name || selectedServer.country_name }}</h3></div>
            <dl>
              <div class="ip-detail-row"><dt>IP</dt><dd class="ip-text">{{ selectedServer.ip }}</dd></div>
              <div><dt>ISP</dt><dd>{{ selectedServer.isp || '—' }}</dd></div>
              <div><dt>ASN</dt><dd>{{ selectedServer.asn || '—' }}</dd></div>
              <div><dt>{{ t('latency') }}</dt><dd>{{ formatLatency(selectedServer) }}</dd></div>
              <div><dt>{{ t('distance') }}</dt><dd>{{ formatDistance(selectedServer.distance) }}</dd></div>
              <div><dt>{{ t('score') }}</dt><dd>{{ selectedServer.eligible ? selectedServer.score.toFixed(1) : t('notRanked') }}</dd></div>
              <div v-if="selectedServer.measurement"><dt>{{ t('sampleRequests') }}</dt><dd>{{ selectedServer.measurement.successful }}/{{ selectedServer.measurement.attempts }}</dd></div>
              <div v-if="selectedServer.measurement?.measuredAt"><dt>UTC</dt><dd>{{ selectedServer.measurement.measuredAt }}</dd></div>
            </dl>
            <p v-if="selectedServer.measurement?.failures?.length" class="form-error">{{ t('probeFailures') }}: {{ selectedServer.measurement.failures.join(', ') }}. {{ t('probeFailed') }}</p>
            <form v-if="!selectedServer.demoGroup" class="probe-form" @submit.prevent="saveAndMeasureSelected">
              <label for="probe-url">{{ t('probeUrl') }}</label>
              <div><WrappingInput id="probe-url" v-model.trim="probeDraft" :disabled="measurementBusy" inputmode="url" placeholder="https://server.example.com/health" @submit="saveAndMeasureSelected" /><button type="submit" :disabled="measurementBusy || syncingCompare || !probeDraft">{{ measuringSelected ? '…' : t('measureNow') }}</button></div>
              <small>{{ t('probeHelp') }}</small>
              <p v-if="probeError" class="form-error" role="alert">{{ probeError }}</p>
              <button v-if="selectedServer.probeUrl" class="clear-probe-button" type="button" @click="clearSelectedProbe" :disabled="measurementBusy">{{ t('clearProbe') }}</button>
            </form>
          </section>

          <div v-if="serverRanking.length" class="export-row ranking-export-row">
            <button type="button" @click="exportRanking('json')"><svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4H7a2 2 0 0 0-2 2v3a2 2 0 0 1-2 2 2 2 0 0 1 2 2v3a2 2 0 0 0 2 2h2M15 4h2a2 2 0 0 1 2 2v3a2 2 0 0 0 2 2 2 2 0 0 0-2 2v3a2 2 0 0 1-2 2h-2"/></svg>{{ t('exportJson') }}</button>
            <button type="button" @click="exportRanking('csv')"><svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 20h14"/></svg>{{ t('exportCsv') }}</button>
          </div>

          <section v-if="!serverRanking.length" class="comparison-placeholder ranking-empty">
            <div class="placeholder-route"><i>SRC</i><span></span><i>1</i></div>
            <strong>{{ t('needTwoIps') }}</strong>
            <p>{{ t('needTwoIpsHint') }}</p>
          </section>

          <p class="accuracy-note compare-accuracy"><span class="accuracy-note-icon" aria-hidden="true">i</span><span class="accuracy-note-text">{{ t('rankingAccuracyNote') }}</span></p>
        </template>

        <template v-else>
          <section class="compare-result-head">
            <p class="kicker">{{ t('ipComparison') }}</p>
            <h2>{{ compareA && compareB ? `${compareA.city_name || compareA.country_name} ↔ ${compareB.city_name || compareB.country_name}` : t('chooseAAndB') }}</h2>
            <p>{{ compareA && compareB ? t('comparisonReady') : t('comparisonEmpty') }}</p>
          </section>

          <section class="compare-slot-grid">
            <article :class="['compare-slot', { empty: !compareA }]">
              <span class="slot-badge point-a">A</span>
              <template v-if="compareA">
                <strong>{{ flagEmoji(compareA.country_code) }} {{ compareA.city_name || compareA.country_name }}</strong>
                <code class="ip-text">{{ compareA.ip }}</code>
                <small>{{ compareA.country_name }}</small>
              </template>
              <span v-else>{{ t('selectPointA') }}</span>
            </article>
            <article :class="['compare-slot', { empty: !compareB }]">
              <span class="slot-badge point-b">B</span>
              <template v-if="compareB">
                <strong>{{ flagEmoji(compareB.country_code) }} {{ compareB.city_name || compareB.country_name }}</strong>
                <code class="ip-text">{{ compareB.ip }}</code>
                <small>{{ compareB.country_name }}</small>
              </template>
              <span v-else>{{ t('selectPointB') }}</span>
            </article>
          </section>

          <section v-if="compareA && compareB" class="comparison-metrics">
            <div class="distance-highlight">
              <span>{{ t('greatCircleDistance') }}</span>
              <strong>{{ formatDistance(compareDistance) }}</strong>
              <small>{{ compareA.country_code }} → {{ compareB.country_code }}</small>
            </div>
            <div class="comparison-table">
              <div class="comparison-header"><span>{{ t('field') }}</span><b>A</b><b>B</b></div>
              <div><span>{{ t('country') }}</span><b>{{ compareA.country_name || '—' }}</b><b>{{ compareB.country_name || '—' }}</b></div>
              <div><span>{{ t('regionCity') }}</span><b>{{ [compareA.region_name, compareA.city_name].filter(Boolean).join(', ') || '—' }}</b><b>{{ [compareB.region_name, compareB.city_name].filter(Boolean).join(', ') || '—' }}</b></div>
              <div><span>ISP</span><b>{{ compareA.isp || '—' }}</b><b>{{ compareB.isp || '—' }}</b></div>
              <div><span>ASN</span><b>{{ compareA.asn || '—' }}</b><b>{{ compareB.asn || '—' }}</b></div>
              <div><span>{{ t('usageType') }}</span><b>{{ compareA.usage_type || '—' }}</b><b>{{ compareB.usage_type || '—' }}</b></div>
              <div><span>{{ t('timezone') }}</span><b>{{ compareA.time_zone || '—' }}</b><b>{{ compareB.time_zone || '—' }}</b></div>
            </div>
            <div class="difference-summary">
              <span :class="{ changed: compareA.country_code !== compareB.country_code }">{{ compareA.country_code === compareB.country_code ? t('sameCountry') : t('differentCountry') }}</span>
              <span :class="{ changed: String(compareA.asn) !== String(compareB.asn) }">{{ String(compareA.asn) === String(compareB.asn) ? t('sameAsn') : t('differentAsn') }}</span>
              <span :class="{ changed: compareA.usage_type !== compareB.usage_type }">{{ compareA.usage_type === compareB.usage_type ? t('sameNetworkType') : t('differentNetworkType') }}</span>
            </div>
          </section>

          <section v-else class="comparison-placeholder">
            <div class="placeholder-route"><i>A</i><span></span><i>B</i></div>
            <strong>{{ t('pickTwoFromMap') }}</strong>
            <p>{{ t('pickTwoHint') }}</p>
          </section>

          <p class="accuracy-note compare-accuracy"><span class="accuracy-note-icon" aria-hidden="true">i</span><span class="accuracy-note-text">{{ t('compareAccuracyNote') }}</span></p>
        </template>
      </aside>

      <ActivityConsole
        :logs="activityLogs"
        :open="consoleOpen"
        :labels="{
          title:t('activityConsole'), note:t('consoleSessionNote'), entries:t('consoleEntries'),
          clear:t('consoleClear'), collapse:t('consoleCollapse'), expand:t('consoleExpand'),
          serverNote:t('consoleServerNote')
        }"
        @toggle="toggleConsole"
        @clear="clearConsole"
      />
    </main>

    <div v-if="showBulk" class="modal-backdrop" @click.self="closeBulk" @keydown.esc.stop.prevent="closeBulk">
      <form ref="bulkDialog" class="modal-card bulk-modal" role="dialog" aria-modal="true" aria-labelledby="bulk-dialog-title" tabindex="-1" @keydown.tab="trapModalFocus($event, bulkDialog)" @submit.prevent="addBulkPoints">
        <div class="modal-heading"><div><p class="kicker">{{ t('bulkIpImport') }}</p><h2 id="bulk-dialog-title">{{ bulkSourceName || csvInspection.format === 'csv' ? t('reviewCsvImport') : t('pasteIpList') }}</h2></div><button ref="bulkCloseButton" class="icon-only-button modal-close-button" type="button" :aria-label="t('closeDialog')" :title="t('closeDialog')" :disabled="bulkLoading || csvInspecting" @click="closeBulk"><svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg></button></div>
        <p v-if="bulkSourceName" class="bulk-source-name"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h8l4 4v14H6zM14 3v5h5M9 13h6M9 17h6"/></svg><span>{{ bulkSourceName }}</span></p>
        <label for="bulk-ip-list">{{ bulkSourceName || csvInspection.format === 'csv' ? t('csvContents') : t('onePerLine') }}</label>
        <textarea ref="bulkFirstControl" id="bulk-ip-list" v-model="bulkInput" rows="5" wrap="soft" spellcheck="false" :disabled="csvInspecting || bulkLoading" placeholder="8.8.8.8&#10;1.1.1.1&#10;example.com"></textarea>
        <p class="form-note">{{ t('bulkImportNote') }}</p>
        <section v-if="csvInspecting" class="csv-schema-panel csv-schema-loading" role="status" aria-live="polite">
          <span class="api-spinner" aria-hidden="true"></span>
          <div><strong>{{ t('csvReadingFile') }}</strong><small>{{ t('csvLocalCheck') }}</small></div>
        </section>
        <section v-else-if="csvInspectionVisible" class="csv-schema-panel" :class="{ invalid: !csvInspection.canImport }" aria-labelledby="csv-schema-title">
          <header class="csv-schema-heading" role="status" aria-live="polite" aria-atomic="true">
            <span class="csv-schema-status-icon" :class="{ invalid: !csvInspection.canImport }" aria-hidden="true">
              <svg v-if="csvInspection.canImport" viewBox="0 0 24 24"><path d="m5 12 4 4L19 6"/></svg>
              <svg v-else viewBox="0 0 24 24"><path d="M12 8v5m0 3h.01"/><path d="M10.3 4.6 3.4 17a2 2 0 0 0 1.8 3h13.6a2 2 0 0 0 1.8-3L13.7 4.6a2 2 0 0 0-3.4 0Z"/></svg>
            </span>
            <div><span id="csv-schema-title">{{ t('csvSchemaTitle') }}</span><strong>{{ t(csvInspection.canImport ? 'csvSchemaValid' : 'csvSchemaInvalid') }}</strong></div>
          </header>
          <p v-if="csvInspection.format === 'plain'" class="csv-schema-note">{{ t('csvPlainListDetected') }}</p>
          <template v-else>
            <p class="csv-schema-note">{{ t('csvOrderFlexible') }}</p>
            <div class="csv-schema-metrics">
              <span>{{ t('csvRowsChecked') }}<strong>{{ csvInspection.dataRowCount }}</strong></span>
              <span>{{ t('csvValidRows') }}<strong>{{ csvInspection.validRowCount }}</strong></span>
              <span :class="{ alert: csvInspection.invalidRowCount }">{{ t('csvInvalidRows') }}<strong>{{ csvInspection.invalidRowCount }}</strong></span>
            </div>
            <h3>{{ t('csvColumnMap') }}</h3>
            <div class="csv-column-map">
              <article v-for="column in csvInspection.columns" :key="`${column.index}-${column.name}`" class="csv-column-card" :class="column.usage">
                <span class="csv-column-number">{{ column.index + 1 }}</span>
                <div><code>{{ column.name }}</code><strong>{{ t(column.labelKey) }}</strong></div>
                <small>{{ csvUsageLabel(column.usage) }}</small>
              </article>
            </div>
            <p v-if="csvInspection.columns.some(column => column.usage === 'reference')" class="csv-metadata-note">{{ t('csvMetadataNote') }}</p>
            <div v-if="csvInspection.issues.length" class="csv-issue-list" role="alert">
              <p v-for="(issue, index) in csvInspection.issues.slice(0, 5)" :key="`${issue.type}-${issue.row || index}`"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5m0 3h.01"/><circle cx="12" cy="12" r="9"/></svg><span>{{ csvIssueLabel(issue) }}</span></p>
              <small v-if="csvInspection.issues.length > 5">+{{ csvInspection.issues.length - 5 }} {{ t('csvMoreIssues') }}</small>
            </div>
            <div v-if="csvInspection.previewRows.length" class="csv-preview-block">
              <h3>{{ t('csvPreview') }}</h3>
              <div class="csv-preview-scroll" tabindex="0" :aria-label="t('csvPreview')">
                <table>
                  <thead><tr><th scope="col">#</th><th v-for="column in csvInspection.columns" :key="`head-${column.index}`" scope="col">{{ column.name }}</th></tr></thead>
                  <tbody><tr v-for="row in csvInspection.previewRows" :key="row.lineNumber" :class="{ invalid: row.invalid }"><th scope="row">{{ row.lineNumber }}</th><td v-for="(cell, index) in row.cells" :key="`${row.lineNumber}-${index}`">{{ cell || '—' }}</td></tr></tbody>
                </table>
              </div>
            </div>
          </template>
          <p class="csv-local-note"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6z"/><path d="m9 12 2 2 4-4"/></svg><span>{{ t('csvLocalCheck') }}</span></p>
        </section>
        <div class="bulk-import-summary" aria-live="polite">
          <span>{{ t('currentList') }} <strong>{{ comparePoints.length }}</strong></span>
          <span>{{ t('incomingList') }} <strong>{{ bulkRecordCount }}</strong></span>
        </div>
        <fieldset class="bulk-mode-selector" :disabled="bulkLoading || csvInspecting">
          <legend>{{ t('importMode') }}</legend>
          <div class="bulk-mode-options">
            <label class="bulk-mode-option" :class="{ selected: bulkMode === 'append' }">
              <input v-model="bulkMode" type="radio" name="bulk-mode" value="append" :aria-describedby="'bulk-append-description'" />
              <span class="bulk-option-copy"><span class="bulk-option-title"><strong>{{ t('appendExisting') }}</strong><em>{{ t('recommendedChoice') }}</em></span><small id="bulk-append-description">{{ t('appendExistingDesc') }}</small></span>
            </label>
            <label class="bulk-mode-option replace-option" :class="{ selected: bulkMode === 'replace' }">
              <input v-model="bulkMode" type="radio" name="bulk-mode" value="replace" :aria-describedby="'bulk-replace-description'" />
              <span class="bulk-option-copy"><strong>{{ t('replaceExisting') }}</strong><small id="bulk-replace-description">{{ t('replaceExistingDesc') }}</small></span>
            </label>
          </div>
        </fieldset>
        <p v-if="bulkMode === 'replace'" class="bulk-replace-warning" role="status"><span aria-hidden="true">!</span>{{ t('replaceWarning') }}</p>
        <div v-if="bulkLoading" class="bulk-progress"><span :style="{ width: `${bulkTotal ? (bulkProgress / bulkTotal) * 100 : 0}%` }"></span></div>
        <div v-if="bulkLoading" class="api-progress-panel" role="status" aria-live="polite">
          <div><span class="api-spinner" aria-hidden="true"></span><strong>{{ t('fetchingApi') }}</strong><span>{{ bulkProgress }}/{{ bulkTotal }}</span></div>
          <progress :value="bulkProgress" :max="bulkTotal" :aria-label="t('fetchingApi')"></progress>
          <small>{{ t('apiProgressCount') }}</small>
        </div>
        <button class="primary-modal-button" :class="{ 'replace-import-button': bulkMode === 'replace' }" type="submit" :disabled="bulkLoading || csvInspecting || addingCurrentIp || !bulkCanImport">{{ bulkLoading ? `${t('locating')} ${bulkProgress}/${bulkTotal}` : t(bulkMode === 'replace' ? 'replaceWithImported' : 'addAllToMap') }}</button>
      </form>
    </div>

    <input ref="csvInput" class="visually-hidden" type="file" tabindex="-1" aria-hidden="true" accept=".csv,.txt,text/csv,text/plain" @change="handleCsvFile" />

    <div v-if="showHelp" class="modal-backdrop" @click.self="closeHelp" @keydown.esc.stop.prevent="closeHelp">
      <section ref="helpDialog" class="modal-card help-modal" role="dialog" aria-modal="true" aria-labelledby="help-dialog-title" tabindex="-1" @keydown.tab="trapModalFocus($event, helpDialog)">
        <div class="modal-heading"><div><p class="kicker">{{ t('quickGuide') }}</p><h2 id="help-dialog-title">{{ t('howItWorks') }}</h2></div><button ref="helpCloseButton" class="icon-only-button modal-close-button" type="button" :aria-label="t('closeDialog')" :title="t('closeDialog')" @click="closeHelp"><svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg></button></div>
        <ol class="help-steps">
          <li><span>1</span><div><strong>{{ t('helpLocate') }}</strong><p>{{ t('helpLocateDesc') }}</p></div></li>
          <li><span>2</span><div><strong>{{ t('helpMeasure') }}</strong><p>{{ t('helpMeasureDesc') }}</p></div></li>
          <li><span>3</span><div><strong>{{ t('helpRecommend') }}</strong><p>{{ t('helpRecommendDesc') }}</p></div></li>
        </ol>
        <div class="formula-box"><code>{{ t('geoFormula') }}<br>{{ t('httpFormula') }}</code></div>
        <p class="help-caveat">{{ t('helpCaveat') }}</p>
        <button class="primary-modal-button" type="button" @click="closeHelp">{{ t('gotIt') }}</button>
      </section>
    </div>

    <div v-if="showDeleteAll" class="modal-backdrop" @click.self="closeDeleteAll" @keydown.esc.stop.prevent="closeDeleteAll">
      <section ref="deleteAllDialog" class="modal-card delete-all-dialog" role="alertdialog" aria-modal="true" aria-labelledby="delete-all-title" aria-describedby="delete-all-description" tabindex="-1" @keydown.tab="trapModalFocus($event, deleteAllDialog)">
        <div class="modal-heading"><div><p class="kicker">{{ t('confirmDeletion') }}</p><h2 id="delete-all-title">{{ t(pendingDeletePointId ? 'deletePointTitle' : 'deleteAllTitle') }}</h2></div><button class="icon-only-button modal-close-button" type="button" :aria-label="t('cancel')" :title="t('cancel')" @click="closeDeleteAll"><svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg></button></div>
        <div class="delete-all-summary" aria-hidden="true"><span><svg viewBox="0 0 24 24"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"/></svg></span><strong>{{ pendingDeletePointId ? 1 : comparePoints.length }}</strong><small>{{ t(pendingDeletePointId ? 'pointToDelete' : 'pointsInList') }}</small></div>
        <p id="delete-all-description" class="delete-all-description">{{ pendingDeletePointId ? `${t('deletePointDescription')} ${pendingDeletePoint?.ip || '—'}` : t('deleteAllDescription') }}</p>
        <p class="delete-all-warning"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5m0 3h.01"/><circle cx="12" cy="12" r="9"/></svg><span>{{ t(pendingDeletePointId ? 'deletePointWarning' : 'deleteAllWarning') }}</span></p>
        <div class="delete-all-actions">
          <button ref="deleteAllCancelButton" type="button" @click="closeDeleteAll">{{ t('cancel') }}</button>
          <button class="confirm-delete-all-button" type="button" @click="confirmPointDeletion"><svg class="button-icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v5m4-5v5"/></svg><span>{{ t(pendingDeletePointId ? 'confirmDeletePoint' : 'confirmDeleteAll') }}</span></button>
        </div>
      </section>
    </div>

    <div class="toast" :class="{ show: toastMessage }" role="status" aria-live="polite">{{ toastMessage }}</div>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import MapCanvas from './components/MapCanvas.vue'
import WrappingInput from './components/WrappingInput.vue'
import IpSourcePicker from './components/IpSourcePicker.vue'
import ActivityConsole from './components/ActivityConsole.vue'
import { demoClient, sampleClients } from './data/ipSamples'
import { getCurrentLocation, lookupTarget } from './services/api'
import { mergeCurrentIp } from './utils/current-ip.js'
import { sameIp } from './utils/ip-identity.js'
import { deduplicatePoints, remapPointSelection } from './utils/point-list.js'
import { measureEndpoint, normalizeProbeUrl, probeMatchesPoint } from './services/probe.js'
import { rankServers, csvCell } from './utils/ranking.js'
import { inspectCsvPattern, normalizeTarget, parseTargetRecords } from './utils/import.js'
import { rankingDemo } from './data/rankingDemo.js'
import { evidenceTranslations } from './data/evidenceTranslations.js'
import { haversine } from './utils/geo'
import { formatDistance as formatKilometres } from './utils/format.js'
import { formatLogTime, safeLogDetail } from './utils/activity-log.js'
import { formatCurrentDateTime, getCurrentDateTimeParts } from './utils/date-time.js'

const translations = {
  en: {
    quickNavigation:'Quick navigation',sections:'Sections',jumpTo:'Choose a section',demoTools:'Demo and examples',compareMenuHint:'Compare two points',serverRanking:'Server Ranking',rankingMenuHint:'Rank every server',rankAllServers:'Rank all IP servers',rankingIntro:'Choose one IP as the source. Every other IP in the same list becomes a server candidate automatically.',sourceIp:'Source IP',rankingFormulaHint:'Route score uses measured browser latency when a Probe URL is available. Without one, distance becomes the transparent fallback signal.',addIpToList:'ADD IPs TO THE LIST',pasteList:'Paste list',importCsv:'Import CSV',allIpPoints:'ALL IP POINTS',chooseSource:'Choose the source IP',source:'Source',recommendedServer:'RECOMMENDED SERVER',bestGeoFit:'BEST GEO FIT',geoFitScore:'Geo fit score',geoFitExplanation:'Estimated from geographic distance and network usage type.',fromSource:'From selected source',allAvailableServers:'All available servers',selectedServer:'SELECTED SERVER',needTwoIps:'Add at least two IPs',needTwoIpsHint:'One IP is the source and the remaining IPs are ranked as servers.',rankingAccuracyNote:'Browser latency is the median of three HTTP requests and includes DNS, TLS and server response time. It is not ICMP ping or a traceroute.',bulkIpImport:'BULK IP IMPORT',pasteIpList:'Paste IP or hostname list',onePerLine:'One IP or hostname per line',bulkImportNote:'Plain lists and CSV with target/ip plus probe_url columns are accepted. Existing IPs are skipped.',addAllToMap:'Locate and add all',bulkComplete:'All IPs were added to the map',bulkPartial:'Some entries could not be located',noValidTargets:'No valid IP or hostname was found in this file.',language:'Language',deleteIp:'Remove IP',ipRemoved:'IP removed from the map',noSampleIps:'No sample IPs remain in the list',workspaceMode:'Workspace mode',ipCompare:'IP Compare',ipMap:'IP MAP',compareAnyTwo:'Compare any two IPs',compareIntro:'All IPs are marked on the map. Select two markers or rows to compare them.',updating:'Updating',updateFromIp2Location:'Update list from IP2Location',addIpToMap:'ADD AN IP TO THE MAP',mapPoints:'MAP POINTS',selectTwoPoints:'Select point A and B',clear:'Clear',ipComparison:'IP COMPARISON',chooseAAndB:'Choose point A and B',comparisonReady:'The selected IPs are connected on the map and compared below.',comparisonEmpty:'Select any two map points to begin.',selectPointA:'Select the first point',selectPointB:'Select the second point',greatCircleDistance:'Great-circle distance',field:'Field',country:'Country',regionCity:'Region / city',timezone:'Timezone',sameCountry:'Same country',differentCountry:'Different countries',sameAsn:'Same ASN',differentAsn:'Different ASN',sameNetworkType:'Same network type',differentNetworkType:'Different network types',pickTwoFromMap:'Pick two points from the map',pickTwoHint:'The first selection becomes A; the second becomes B. Select another point to replace B.',compareAccuracyNote:'Locations come from IP2Location and are approximate. Anycast IPs can resolve to different network locations.',usingLiveList:'List updated with IP2Location',usingSampleList:'Bundled sample locations — update when the Live API is ready',updateComplete:'IP list updated from IP2Location',partialUpdate:'Some IPs used bundled locations because the Live API did not return them',addedToMap:'IP added to the map',measureAvailable:'Measure available probes',measuringLatency:'Measuring',bestRouteMatch:'BEST ROUTE MATCH',routeScoreExplanation:'Latency, geographic distance and network suitability with a visible score breakdown.',browserMeasured:'Median of 3 browser HTTP requests',distanceFallback:'Distance-based fallback',confidence:'Confidence',estimated:'Estimated',threeSamples:'3 successful samples',noProbeYet:'Add a Probe URL to measure',latencySignal:'Latency signal',whyThisServer:'Why this server ranked first',probeUrl:'Probe URL (optional)',measureNow:'Measure now',probeHelp:'Use an HTTP(S) health or lightweight asset URL served by this candidate. Timing includes connection and server overhead.',probeSaved:'Probe measured and ranking updated',probeFailed:'The probe could not be reached from this browser',unreachable:'Unreachable',noProbes:'Add at least one Probe URL first',measurementComplete:'Available probes measured',measurementPartial:'Some probes could not be reached',
    brandNote:'Compare IPs and rank servers worldwide',liveGeo:'LIVE IP2LOCATION',demoGeo:'DEMO DATA',refresh:'Refresh',help:'Help',theme:'Theme',closeDialog:'Close dialog',clientLocation:'CLIENT LOCATION',unknownCity:'Unknown city',copyIp:'Copy IP',testAnotherIp:'Test another client IP or hostname',ipPlaceholder:'8.8.8.8 or example.com',quickSample:'Quick country / IP sample',chooseCountryIp:'Choose a country and sample IP',sampleIpNote:'Live mode looks up the selected IP with IP2Location. Anycast results can vary.',scenario:'SCENARIO',chooseUseCase:'Choose a use case',addEndpoint:'Add endpoint',endpoints:'ENDPOINTS',candidates:'candidates',testingEndpoints:'Testing endpoints…',runAnalysis:'Run route analysis',recommendedEndpoint:'RECOMMENDED ENDPOINT',bestMatch:'BEST MATCH',routeScore:'Route score',scoreExplanation:'Combined health, latency, distance and network fit.',latency:'Latency',distance:'Distance',health:'Health',network:'Network',measured:'Measured',demoEstimate:'Demo estimate',greatCircle:'Great-circle distance',endpointStatus:'Endpoint status',usageType:'IP usage type',routeRanking:'ROUTE RANKING',allCandidates:'All candidates',simulateFailover:'Simulate failover',selectedEndpoint:'SELECTED ENDPOINT',location:'Location',score:'Score',exportJson:'Export JSON',exportCsv:'Export CSV',accuracyNote:'Geographic distance is an estimate and does not guarantee network latency. Browser measurements are weighted more heavily.',customEndpoint:'CUSTOM ENDPOINT',endpointName:'Endpoint name',hostOrIp:'Hostname or public IP',probeNote:'Without a probe URL, GeoIP still works and latency is marked as an estimate.',locating:'Locating…',locateAndAdd:'Locate and add endpoint',quickGuide:'QUICK GUIDE',howItWorks:'How GeoIP2Route works',helpLocate:'Add IPs',helpLocateDesc:'Add one IP, paste a list or import CSV. IP2Location supplies location, ISP, ASN and network type.',helpMeasure:'Compare',helpMeasureDesc:'Choose any two IPs and inspect their geographic and network differences on the map.',helpRecommend:'Rank and verify',helpRecommendDesc:'Choose a source, add optional Probe URLs, measure browser latency and inspect every score component.',helpCaveat:'IP geolocation is approximate and is not GPS. HTTP timing includes browser and server overhead, so the app always labels measured and estimated evidence separately.',gotIt:'Got it',excellent:'Excellent',good:'Good',fair:'Fair',poor:'Poor',online:'Online',degraded:'Degraded',offline:'Offline',testing:'Testing'
  },
  th: {
    quickNavigation:'การนำทางด่วน',sections:'หัวข้อ',jumpTo:'เลือกส่วนที่ต้องการ',demoTools:'ส่วนสาธิตและตัวอย่าง',compareMenuHint:'เปรียบเทียบสองจุด',serverRanking:'จัดอันดับเซิร์ฟเวอร์',rankingMenuHint:'จัดอันดับเซิร์ฟเวอร์ทุกจุด',rankAllServers:'จัดอันดับเซิร์ฟเวอร์ทั้งหมด',rankingIntro:'เลือก IP หนึ่งรายการเป็นจุดอ้างอิง จากนั้นระบบจะจัดให้ IP อื่นทั้งหมดในรายการเดียวกันเป็นเซิร์ฟเวอร์ที่เป็นตัวเลือกโดยอัตโนมัติ',sourceIp:'IP อ้างอิง',rankingFormulaHint:'คะแนนความเหมาะสมใช้เวลาตอบสนองที่ตรวจวัดจากเบราว์เซอร์เมื่อกำหนด URL สำหรับตรวจวัดไว้ หากไม่มี ระบบจะใช้ระยะทางเป็นหลักฐานสำรองและแสดงให้ทราบอย่างชัดเจน',addIpToList:'เพิ่ม IP ลงในรายการ',pasteList:'วางรายการ',importCsv:'นำเข้า CSV',allIpPoints:'จุด IP ทั้งหมด',chooseSource:'เลือก IP อ้างอิง',source:'จุดอ้างอิง',recommendedServer:'เซิร์ฟเวอร์ที่แนะนำ',bestGeoFit:'เหมาะสมเชิงภูมิศาสตร์ที่สุด',geoFitScore:'คะแนนความเหมาะสมเชิงภูมิศาสตร์',geoFitExplanation:'ประเมินจากระยะทางเชิงภูมิศาสตร์และประเภทการใช้งานเครือข่าย',fromSource:'จาก IP อ้างอิง',allAvailableServers:'เซิร์ฟเวอร์ที่พร้อมเปรียบเทียบทั้งหมด',selectedServer:'เซิร์ฟเวอร์ที่เลือก',needTwoIps:'โปรดเพิ่ม IP อย่างน้อยสองรายการ',needTwoIpsHint:'กำหนด IP หนึ่งรายการเป็นจุดอ้างอิง และระบบจะจัดอันดับ IP ที่เหลือเป็นเซิร์ฟเวอร์ที่เป็นตัวเลือก',rankingAccuracyNote:'เวลาตอบสนองจากเบราว์เซอร์เป็นค่ามัธยฐานจากคำขอ HTTP 3 ครั้ง และอาจรวมเวลา DNS, TLS และการตอบสนองของเซิร์ฟเวอร์ ค่านี้มิใช่ ICMP Ping หรือ Traceroute',bulkIpImport:'นำเข้า IP หลายรายการ',pasteIpList:'วางรายการ IP หรือชื่อโฮสต์',onePerLine:'ระบุ IP หรือชื่อโฮสต์หนึ่งรายการต่อบรรทัด',bulkImportNote:'รองรับรายการทั่วไปและ CSV ที่มีคอลัมน์ target หรือ ip รวมทั้งคอลัมน์ probe_url ที่ไม่บังคับ ระบบจะรวม IP ที่ซ้ำกัน',addAllToMap:'ค้นหาตำแหน่งและเพิ่มทั้งหมด',bulkComplete:'เพิ่ม IP ทั้งหมดลงบนแผนที่เรียบร้อยแล้ว',bulkPartial:'ไม่สามารถค้นหาตำแหน่งของบางรายการได้',noValidTargets:'ไม่พบ IP หรือชื่อโฮสต์ที่ถูกต้องในไฟล์นี้',language:'ภาษา',deleteIp:'ลบ IP',ipRemoved:'นำ IP ออกจากแผนที่เรียบร้อยแล้ว',noSampleIps:'ไม่มี IP ตัวอย่างอยู่ในรายการ',workspaceMode:'โหมดการทำงาน',ipCompare:'เปรียบเทียบ IP',ipMap:'แผนที่ IP',compareAnyTwo:'เปรียบเทียบ IP สองจุด',compareIntro:'IP ทุกรายการจะแสดงเป็นหมุดบนแผนที่ โปรดเลือกหมุดหรือแถวข้อมูลสองรายการเพื่อเปรียบเทียบ',updating:'กำลังปรับปรุงข้อมูล',updateFromIp2Location:'ปรับปรุงรายการจาก IP2Location',addIpToMap:'เพิ่ม IP ลงบนแผนที่',mapPoints:'จุดบนแผนที่',selectTwoPoints:'เลือกจุด A และ B',clear:'ล้าง',ipComparison:'การเปรียบเทียบ IP',chooseAAndB:'โปรดเลือกจุด A และ B',comparisonReady:'ระบบเชื่อมจุด IP ที่เลือกบนแผนที่และแสดงข้อมูลเปรียบเทียบด้านล่าง',comparisonEmpty:'โปรดเลือกจุดบนแผนที่สองจุดเพื่อเริ่มการเปรียบเทียบ',selectPointA:'เลือกจุดแรก',selectPointB:'เลือกจุดที่สอง',greatCircleDistance:'ระยะทางวงกลมใหญ่',field:'รายการข้อมูล',country:'ประเทศ',regionCity:'ภูมิภาค / เมือง',timezone:'เขตเวลา',sameCountry:'ประเทศเดียวกัน',differentCountry:'ประเทศแตกต่างกัน',sameAsn:'ASN เดียวกัน',differentAsn:'ASN แตกต่างกัน',sameNetworkType:'ประเภทเครือข่ายเดียวกัน',differentNetworkType:'ประเภทเครือข่ายแตกต่างกัน',pickTwoFromMap:'เลือกสองจุดจากแผนที่',pickTwoHint:'จุดแรกที่เลือกจะเป็น A และจุดที่สองจะเป็น B เมื่อเลือกจุดใหม่ ระบบจะแทนที่จุด B',compareAccuracyNote:'ตำแหน่งจาก IP2Location เป็นค่าประมาณ ทั้งนี้ Anycast IP อาจระบุตำแหน่งเครือข่ายแตกต่างกัน',usingLiveList:'ปรับปรุงรายการด้วยข้อมูลจาก IP2Location เรียบร้อยแล้ว',usingSampleList:'กำลังใช้ตำแหน่งตัวอย่าง โปรดปรับปรุงรายการเมื่อ API ข้อมูลจริงพร้อมใช้งาน',updateComplete:'ปรับปรุงรายการ IP จาก IP2Location เรียบร้อยแล้ว',partialUpdate:'IP บางรายการยังใช้ตำแหน่งเดิม เนื่องจาก API ข้อมูลจริงไม่ส่งผลลัพธ์กลับมา',addedToMap:'เพิ่ม IP ลงบนแผนที่เรียบร้อยแล้ว',measureAvailable:'ตรวจวัด URL ที่กำหนดไว้',measuringLatency:'กำลังตรวจวัด',bestRouteMatch:'คะแนนความเหมาะสมสูงสุด',routeScoreExplanation:'ประเมินจากเวลาตอบสนอง ระยะทาง และความเหมาะสมของเครือข่าย พร้อมแสดงองค์ประกอบของคะแนน',browserMeasured:'ค่ามัธยฐานจากคำขอ HTTP 3 ครั้ง',distanceFallback:'ใช้ระยะทางเป็นหลักฐานสำรอง',confidence:'ประเภทหลักฐาน',estimated:'ค่าประเมิน',threeSamples:'ตรวจวัดสำเร็จ 3 ครั้ง',noProbeYet:'โปรดเพิ่ม URL สำหรับตรวจวัด',latencySignal:'เวลาตอบสนอง HTTP',whyThisServer:'เหตุผลที่เซิร์ฟเวอร์นี้ได้รับอันดับหนึ่ง',probeUrl:'URL สำหรับตรวจวัด (ไม่บังคับ)',measureNow:'ตรวจวัดขณะนี้',probeHelp:'ใช้ URL ของปลายทางตรวจสอบสถานะหรือไฟล์ขนาดเล็กจากเซิร์ฟเวอร์นี้ เวลาที่ได้อาจรวมการเชื่อมต่อและการตอบสนองของเซิร์ฟเวอร์',probeSaved:'ตรวจวัดและบันทึกผลเรียบร้อยแล้ว ระบบได้ปรับปรุงอันดับ',probeFailed:'เบราว์เซอร์นี้ไม่สามารถเข้าถึง URL สำหรับตรวจวัดได้',unreachable:'ไม่สามารถเข้าถึงได้',noProbes:'โปรดเพิ่ม URL สำหรับตรวจวัดอย่างน้อยหนึ่งรายการ',measurementComplete:'ตรวจวัด URL ที่กำหนดไว้ทั้งหมดเรียบร้อยแล้ว',measurementPartial:'ไม่สามารถเข้าถึง URL สำหรับตรวจวัดบางรายการได้',
    brandNote:'เปรียบเทียบตำแหน่ง IP และจัดอันดับเซิร์ฟเวอร์ทั่วโลก',liveGeo:'ข้อมูลจริงจาก IP2Location',demoGeo:'ข้อมูลจำลอง',refresh:'รีเฟรช',help:'คู่มือใช้งาน',theme:'รูปแบบสี',closeDialog:'ปิดหน้าต่าง',clientLocation:'ตำแหน่งของผู้ใช้',unknownCity:'ไม่ทราบชื่อเมือง',copyIp:'คัดลอก IP',testAnotherIp:'ทดสอบ IP ของผู้ใช้หรือชื่อโฮสต์อื่น',ipPlaceholder:'8.8.8.8 หรือ example.com',quickSample:'ตัวอย่างประเทศและ IP',chooseCountryIp:'เลือกประเทศและ IP ตัวอย่าง',sampleIpNote:'โหมดข้อมูลจริงจะค้นหา IP ที่เลือกด้วย IP2Location ทั้งนี้ผลลัพธ์ของ Anycast อาจเปลี่ยนแปลงได้',scenario:'สถานการณ์',chooseUseCase:'เลือกกรณีการใช้งาน',addEndpoint:'เพิ่มปลายทาง',endpoints:'ปลายทาง',candidates:'ตัวเลือก',testingEndpoints:'กำลังทดสอบปลายทาง…',runAnalysis:'วิเคราะห์ความเหมาะสม',recommendedEndpoint:'ปลายทางที่แนะนำ',bestMatch:'เหมาะสมที่สุด',routeScore:'คะแนนความเหมาะสม',scoreExplanation:'ประเมินจากสถานะ เวลาตอบสนอง ระยะทาง และประเภทเครือข่าย',latency:'เวลาตอบสนอง',distance:'ระยะทาง',health:'สถานะ',network:'เครือข่าย',measured:'ตรวจวัดจริง',demoEstimate:'ค่าจำลอง',greatCircle:'ระยะทางวงกลมใหญ่',endpointStatus:'สถานะของปลายทาง',usageType:'ประเภทการใช้งาน IP',routeRanking:'อันดับความเหมาะสม',allCandidates:'ตัวเลือกทั้งหมด',simulateFailover:'จำลองการหยุดให้บริการ',selectedEndpoint:'ปลายทางที่เลือก',location:'ตำแหน่ง',score:'คะแนน',exportJson:'ส่งออกเป็น JSON',exportCsv:'ส่งออกเป็น CSV',accuracyNote:'ระยะทางเชิงภูมิศาสตร์เป็นค่าประมาณและไม่รับประกันความเร็วของเครือข่าย ระบบจึงให้น้ำหนักแก่ค่าที่ตรวจวัดจากเบราว์เซอร์มากกว่า',customEndpoint:'ปลายทางที่กำหนดเอง',endpointName:'ชื่อปลายทาง',hostOrIp:'ชื่อโฮสต์หรือ IP สาธารณะ',probeNote:'หากไม่มี URL สำหรับตรวจวัด ระบบยังสามารถค้นหาข้อมูล GeoIP ได้ แต่จะแสดงเวลาตอบสนองเป็นค่าประเมิน',locating:'กำลังค้นหาตำแหน่ง…',locateAndAdd:'ค้นหาตำแหน่งและเพิ่มปลายทาง',quickGuide:'คู่มือใช้งานฉบับย่อ',howItWorks:'หลักการทำงานของ GeoIP2Route',helpLocate:'เพิ่ม IP',helpLocateDesc:'เพิ่ม IP หนึ่งรายการ วางหลายรายการ หรือนำเข้า CSV โดย IP2Location จะให้ข้อมูลตำแหน่ง ISP, ASN และประเภทเครือข่าย',helpMeasure:'เปรียบเทียบ',helpMeasureDesc:'เลือก IP สองจุดเพื่อตรวจสอบความแตกต่างด้านภูมิศาสตร์และเครือข่ายบนแผนที่',helpRecommend:'จัดอันดับและตรวจสอบ',helpRecommendDesc:'เลือกจุดอ้างอิง กำหนด URL สำหรับตรวจวัดหากมี ตรวจวัดเวลาตอบสนองจากเบราว์เซอร์ และตรวจสอบองค์ประกอบของคะแนน',helpCaveat:'ตำแหน่ง IP เป็นค่าประมาณ มิใช่ GPS และเวลา HTTP อาจรวมภาระจากเบราว์เซอร์และเซิร์ฟเวอร์ ระบบจึงแยกผลที่ตรวจวัดจริงออกจากค่าประเมินอย่างชัดเจน',gotIt:'รับทราบ',excellent:'ดีเยี่ยม',good:'ดี',fair:'ปานกลาง',poor:'ควรปรับปรุง',online:'พร้อมใช้งาน',degraded:'ประสิทธิภาพลดลง',offline:'ไม่พร้อมใช้งาน',testing:'กำลังทดสอบ'
  }
}

const language = ref(localStorage.getItem('sakura-language') === 'th' ? 'th' : 'en')
const themeMode = ref(localStorage.getItem('sakura-theme') || 'auto')
const now = ref(new Date())
const client = ref({ ...demoClient })
const savedMode = localStorage.getItem('sakura-app-mode')
const appMode = ref(['route','ranking'].includes(savedMode) ? 'ranking' : 'compare')
const comparePoints = ref(sampleClients.map(sample => bundledComparePoint(sample)))
const selectedCompareIds = ref(sampleClients.slice(0, 2).map(sample => sample.id))
const rankingSourceId = ref(sampleClients[0]?.id || '')
const selectedServerId = ref(sampleClients[1]?.id || '')
const compareTarget = ref('')
const syncingCompare = ref(false)
const compareProgress = ref(0)
const addingComparePoint = ref(false)
const addingCurrentIp = ref(false)
const currentIpError = ref('')
const currentIpNotice = ref('')
const refreshTotal = ref(0)
const showBulk = ref(false)
const bulkInput = ref('')
const bulkMode = ref('append')
const bulkSourceName = ref('')
const csvInspecting = ref(false)
const bulkLoading = ref(false)
const bulkProgress = ref(0)
const bulkTotal = ref(0)
const csvInput = ref(null)
const bulkDialog = ref(null)
const bulkCloseButton = ref(null)
const bulkFirstControl = ref(null)
const showHelp = ref(false)
const helpTrigger = ref(null)
const helpDialog = ref(null)
const helpCloseButton = ref(null)
const showDeleteAll = ref(false)
const deleteAllDialog = ref(null)
const deleteAllCancelButton = ref(null)
const pendingDeletePointId = ref('')
const resultPanel = ref(null)
const controlPanel = ref(null)
const sidebarStickyHeader = ref(null)
const sidebarJumpTarget = ref('current')
const headerJumpOpen = ref(false)
const currentIpSection = ref(null)
const updateSection = ref(null)
const addIpSection = ref(null)
const mapPointsSection = ref(null)
const demoSection = ref(null)
const probeDraft = ref('')
const measuringSelected = ref(false)
const measuringAll = ref(false)
const measureProgress = ref(0)
const measureTotal = ref(0)
const rankingBasis = ref('geo')
const probeError = ref('')
const toastMessage = ref('')
const consoleOpen = ref(localStorage.getItem('sakura-console-open') !== 'false')
const activityLogs = ref([])
let clockTimer
let toastTimer
let activitySequence = 0
let modalReturnTarget = null

const t = key => evidenceTranslations[language.value]?.[key] || translations[language.value]?.[key] || evidenceTranslations.en[key] || translations.en[key] || key
const themeActionLabel = mode => `${t('theme')}: ${(language.value === 'th' ? { light:'สว่าง', dark:'มืด', auto:'อัตโนมัติ' } : { light:'Light', dark:'Dark', auto:'Automatic' })[mode] || mode}`
const resolvedTheme = computed(() => themeMode.value === 'auto' ? (now.value.getHours() < 6 || now.value.getHours() >= 18 ? 'dark' : 'light') : themeMode.value)
const compareA = computed(() => comparePoints.value.find(point => point.id === selectedCompareIds.value[0]))
const compareB = computed(() => comparePoints.value.find(point => point.id === selectedCompareIds.value[1]))
const compareDistance = computed(() => compareA.value && compareB.value ? haversine(compareA.value, compareB.value) : 0)
const rankingSource = computed(() => comparePoints.value.find(point => point.id === rankingSourceId.value))
const clockReference = computed(() => (appMode.value === 'ranking' ? rankingSource.value : compareA.value) || comparePoints.value[0] || null)
const clockReferenceCode = computed(() => clockReference.value?.country_code || t('localClockCode'))
const clockReferenceName = computed(() => clockReference.value?.country_name || t('deviceClockReference'))
const clockReferenceTimeZone = computed(() => clockReference.value?.time_zone || '')
const clockReferenceLabel = computed(() => `${t(clockReference.value ? 'ipClockReference' : 'deviceClockReference')}: ${clockReferenceName.value}`)
const currentDateTime = computed(() => formatCurrentDateTime(now.value, language.value, clockReferenceTimeZone.value))
const currentDateTimeParts = computed(() => getCurrentDateTimeParts(now.value, language.value, clockReferenceTimeZone.value))
const serverRanking = computed(() => rankServers(comparePoints.value, rankingSourceId.value, rankingBasis.value))
const bestServer = computed(() => serverRanking.value.find(point => point.eligible))
const selectedServer = computed(() => serverRanking.value.find(point => point.id === selectedServerId.value) || bestServer.value || serverRanking.value[0])
const compareRefreshTotal = computed(() => comparePoints.value.filter(point => !point.demoGroup).length)
const csvInspection = computed(() => inspectCsvPattern(bulkInput.value))
const csvInspectionVisible = computed(() => Boolean(bulkSourceName.value) || csvInspection.value.format === 'csv')
const bulkRecordCount = computed(() => csvInspection.value.recordCount)
const bulkCanImport = computed(() => csvInspection.value.canImport)
const probeCount = computed(() => comparePoints.value.filter(point => point.id !== rankingSourceId.value && !point.demoGroup && probeMatchesPoint(point, point.probeUrl)).length)
const measurementBusy = computed(() => measuringAll.value || measuringSelected.value)
const pointListBusy = computed(() => syncingCompare.value || addingCurrentIp.value || addingComparePoint.value || bulkLoading.value || measurementBusy.value)
const pendingDeletePoint = computed(() => comparePoints.value.find(point => point.id === pendingDeletePointId.value))
const apiWork = computed(() => {
  if (addingCurrentIp.value || addingComparePoint.value) return {completed:0,total:0}
  if (syncingCompare.value) return {completed:compareProgress.value,total:refreshTotal.value}
  if (bulkLoading.value) return {completed:bulkProgress.value,total:bulkTotal.value}
  return null
})
const geoWinner = computed(() => rankServers(comparePoints.value.filter(point => rankingBasis.value !== 'demo' || point.demoGroup), rankingSourceId.value, 'geo')[0])
const compareSourceNote = computed(() => {
  const liveCount = comparePoints.value.filter(point => point.source === 'ip2location').length
  if (!comparePoints.value.length) return t('noSampleIps')
  return liveCount ? `${t('usingLiveList')} · ${liveCount}/${comparePoints.value.length} ${t('liveBadge')}` : t('usingSampleList')
})
const mapLabels = computed(() => language.value === 'th'
  ? { map:'แผนที่ตำแหน่ง IP และเซิร์ฟเวอร์',zoomControls:'ส่วนควบคุมแผนที่',zoomIn:'ซูมเข้า',zoomOut:'ซูมออก',resetZoom:'จัดให้ทุกจุดอยู่กึ่งกลางแผนที่',mapScale:'มาตราส่วนระยะทางบนแผนที่',gridCell:'1 ช่อง',kilometres:'กม.',metres:'ม.',client:'ผู้ใช้',recommended:'แนะนำ',fallback:'สำรอง',other:'จุดอื่น',pointA:'จุด A',pointB:'จุด B',source:'IP อ้างอิง',bestServer:'อันดับ 1',otherServers:'ตัวเลือกอื่น',selectPoint:'เลือกจุด',selectServer:'เลือกเซิร์ฟเวอร์',referenceOnly:t('referenceOnly') }
  : { map:'IP and server location map',zoomControls:'Map controls',zoomIn:'Zoom in',zoomOut:'Zoom out',resetZoom:'Center and fit all points',mapScale:'Map distance scale',gridCell:'1 grid',kilometres:'km',metres:'m',client:'Client',recommended:'Recommended',fallback:'Fallback',other:'Other points',pointA:'Point A',pointB:'Point B',source:'Reference IP',bestServer:'Highest score',otherServers:'Other candidates',selectPoint:'Select point',selectServer:'Select server',referenceOnly:t('referenceOnly') })

function flagEmoji(code = '') { return String(code).toUpperCase().replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt())) || '🌐' }
function formatDistance(km) { return formatKilometres(km, language.value) }
function formatLatency(server) {
  const m = server?.measurement
  if (!m || (m.kind === 'simulated' && rankingBasis.value !== 'demo')) return '—'
  return m.status === 'measured' ? `${Math.round(m.latency)} ms` : t('unreachable')
}
function scoreReason(server) {
  if (!server) return ''
  const runner = serverRanking.value.find(point => point.rank === 2)
  const gap = runner ? (server.score - runner.score).toFixed(1) : null
  const main = rankingBasis.value === 'geo' ? t('distance') : t('latency')
  const contribution = server.components[0].contribution.toFixed(1)
  const network = server.components[1].contribution.toFixed(1)
  const explanation = language.value === 'th'
    ? `${main} คิดเป็น ${contribution} คะแนน + เครือข่าย ${network} คะแนน = ${server.score.toFixed(1)}`
    : `${main} contributes ${contribution} points + network ${network} points = ${server.score.toFixed(1)}.`
  return explanation + (gap === null ? ` ${t('onlyEligible')}` : language.value === 'th' ? ` โดยสูงกว่าอันดับ 2 จำนวน ${gap} คะแนน` : ` Lead over #2: ${gap} points.`)
}
function showToast(message) { toastMessage.value = message; clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastMessage.value = '' }, 5000) }
function writeActivity(level, key, detail = '') {
  const safeDetail = safeLogDetail(detail)
  activityLogs.value.push({
    id: ++activitySequence,
    time: formatLogTime(new Date(), language.value),
    level,
    message: safeDetail ? `${t(key)} · ${safeDetail}` : t(key)
  })
  if (activityLogs.value.length > 200) activityLogs.value.splice(0, activityLogs.value.length - 200)
}
function clearConsole() {
  activityLogs.value = []
  writeActivity('INFO', 'consoleReady')
}
function toggleConsole() { consoleOpen.value = !consoleOpen.value }

function cycleTheme() {
  const modes = ['light', 'dark', 'auto']
  themeMode.value = modes[(modes.indexOf(themeMode.value) + 1) % modes.length]
}

function rememberModalTrigger() {
  modalReturnTarget = document.activeElement instanceof HTMLElement ? document.activeElement : null
}

function restoreModalFocus() {
  const target = modalReturnTarget
  modalReturnTarget = null
  if (target?.isConnected) requestAnimationFrame(() => target.focus())
}

async function openHelp() {
  rememberModalTrigger()
  showHelp.value = true
  await nextTick()
  helpCloseButton.value?.focus()
}

function closeHelp() {
  if (!showHelp.value) return
  showHelp.value = false
  restoreModalFocus()
}

async function openBulk() {
  rememberModalTrigger()
  bulkMode.value = 'append'
  bulkSourceName.value = ''
  showBulk.value = true
  await nextTick()
  bulkFirstControl.value?.focus()
}

function closeBulk() {
  if (!showBulk.value || bulkLoading.value || csvInspecting.value) return
  showBulk.value = false
  restoreModalFocus()
}

async function openDeleteAll() {
  if (!comparePoints.value.length || pointListBusy.value) return
  rememberModalTrigger()
  pendingDeletePointId.value = ''
  showDeleteAll.value = true
  await nextTick()
  deleteAllCancelButton.value?.focus()
}

async function openDeletePoint(id) {
  if (!comparePoints.value.some(point => point.id === id) || pointListBusy.value) return
  rememberModalTrigger()
  pendingDeletePointId.value = id
  showDeleteAll.value = true
  await nextTick()
  deleteAllCancelButton.value?.focus()
}

function closeDeleteAll() {
  if (!showDeleteAll.value) return
  showDeleteAll.value = false
  pendingDeletePointId.value = ''
  restoreModalFocus()
}

function clearCompareSelection() {
  if (!selectedCompareIds.value.length) return
  selectedCompareIds.value = []
  showToast(t('pointSelectionCleared'))
  writeActivity('INFO', 'consolePointSelectionCleared')
}

async function confirmPointDeletion() {
  if (!showDeleteAll.value || !comparePoints.value.length || pointListBusy.value) return
  const pointId = pendingDeletePointId.value
  showDeleteAll.value = false
  pendingDeletePointId.value = ''
  modalReturnTarget = null
  if (pointId) {
    removeComparePoint(pointId)
    await nextTick()
    document.querySelector('.compare-add-form .wrapping-input')?.focus()
    return
  }
  const removedCount = comparePoints.value.length
  comparePoints.value = []
  selectedCompareIds.value = []
  rankingSourceId.value = ''
  selectedServerId.value = ''
  rankingBasis.value = 'geo'
  probeDraft.value = ''
  currentIpError.value = ''
  currentIpNotice.value = ''
  showToast(t('allPointsDeleted'))
  writeActivity('INFO', 'consoleAllPointsDeleted', String(removedCount))
  await nextTick()
  document.querySelector('.compare-add-form .wrapping-input')?.focus()
}

function csvUsageLabel(usage) {
  return t({ required:'csvRequired', optional:'csvOptional', reference:'csvReferenceOnly', ignored:'csvIgnored' }[usage] || 'csvIgnored')
}

function csvIssueLabel(issue) {
  const key = {
    missing_target_header:'csvIssueMissingTarget', duplicate_target_header:'csvIssueDuplicateTarget', duplicate_probe_header:'csvIssueDuplicateProbe',
    invalid_target:'csvIssueInvalidTarget', invalid_probe:'csvIssueInvalidProbe', probe_mismatch:'csvIssueProbeMismatch', extra_columns:'csvIssueExtraColumns',
    csv_quote:'csvIssueQuote', invalid_plain_list:'csvIssuePlainList', no_data_rows:'csvIssueNoRows', too_many_entries:'csvIssueTooMany', import_error:'csvIssueImport'
  }[issue.type] || 'csvIssueImport'
  return issue.row ? `${t('csvRow')} ${issue.row}: ${t(key)}` : t(key)
}

function trapModalFocus(event, dialog) {
  if (!dialog) return
  const focusable = [...dialog.querySelectorAll('button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])')]
  if (!focusable.length) {
    event.preventDefault()
    dialog.focus()
    return
  }
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

async function revealMobileResults() {
  await nextTick()
  if (!window.matchMedia('(max-width: 680px)').matches || !resultPanel.value) return
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  resultPanel.value.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  resultPanel.value.focus({ preventScroll: true })
}

async function jumpToSidebar(section) {
  sidebarJumpTarget.value = section
  headerJumpOpen.value = false
  await nextTick()
  const targets = {
    current: currentIpSection,
    update: updateSection,
    add: addIpSection,
    points: mapPointsSection,
    demo: demoSection
  }
  const target = targets[section]?.value
  if (!target) return
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'start' })
  target.focus({ preventScroll: true })
}

function updateSidebarJumpTarget() {
  const panel = controlPanel.value
  const stickyHeader = sidebarStickyHeader.value
  if (!panel || !stickyHeader || window.matchMedia('(max-width: 900px)').matches) return
  const panelTop = panel.getBoundingClientRect().top
  const stickyHeight = stickyHeader.offsetParent ? stickyHeader.offsetHeight : 0
  const threshold = panelTop + stickyHeight + 24
  const targets = [
    ['current', currentIpSection.value],
    ['update', updateSection.value],
    ['add', addIpSection.value],
    ['points', mapPointsSection.value],
    ['demo', demoSection.value]
  ]
  let active = targets.find(([, element]) => element)?.[0] || 'current'
  for (const [section, element] of targets) {
    if (element && element.getBoundingClientRect().top <= threshold) active = section
  }
  sidebarJumpTarget.value = active
}

function closeHeaderJumpOnFocusOut(event) {
  if (!event.currentTarget.contains(event.relatedTarget)) headerJumpOpen.value = false
}

async function loadRankingDemo() {
  if (measurementBusy.value || syncingCompare.value || addingCurrentIp.value) return
  const ids = new Set(comparePoints.value.map(point => point.id))
  comparePoints.value.push(...rankingDemo.filter(point => !ids.has(point.id)).map(point => localizeDemoPoint(structuredClone(point))))
  rankingSourceId.value = 'demo-th'
  rankingBasis.value = 'demo'
  selectedServerId.value = 'demo-jp'
  appMode.value = 'ranking'
  writeActivity('DEMO', 'consoleDemoLoaded')
  await revealMobileResults()
}
function loadProbeExample() {
  bulkInput.value = 'target,probe_url\ndns.google,https://dns.google/resolve?name=example.com&type=A'
  openBulk()
  writeActivity('INFO', 'consoleLiveExampleLoaded')
}
async function measurePointById(id) {
  const point = comparePoints.value.find(item => item.id === id)
  if (!point || point.demoGroup || !probeMatchesPoint(point, point.probeUrl)) return false
  const url = point.probeUrl
  writeActivity('WAIT', 'consoleMeasurementStarted', point.ip)
  comparePoints.value = comparePoints.value.map(item => item.id === id ? { ...item, measurement:undefined } : item)
  const measurement = await measureEndpoint({ probeUrl:url })
  comparePoints.value = comparePoints.value.map(item => item.id === id && item.probeUrl === url ? { ...item, measurement } : item)
  writeActivity(measurement.status === 'measured' ? 'OK' : 'ERROR', measurement.status === 'measured' ? 'consoleMeasurementFinished' : 'consoleMeasurementFailed', measurement.status === 'measured' ? `${point.ip} · ${Math.round(measurement.latency)} ms` : point.ip)
  return measurement.status === 'measured'
}
async function saveAndMeasureSelected() {
  if (!selectedServer.value || measurementBusy.value || selectedServer.value.demoGroup) return
  probeError.value = ''
  try {
    probeDraft.value = normalizeProbeUrl(probeDraft.value)
    if (!probeMatchesPoint(selectedServer.value, probeDraft.value)) throw new Error(t('probeMismatch'))
    measuringSelected.value = true
    const id = selectedServer.value.id
    comparePoints.value = comparePoints.value.map(point => point.id === id ? { ...point, probeUrl:probeDraft.value, measurement:undefined } : point)
    const success = await measurePointById(id)
    rankingBasis.value = 'browser'
    showToast(success ? t('probeSaved') : t('probeFailed'))
  } catch (error) {
    probeError.value = error.message
    writeActivity('ERROR', 'consoleMeasurementFailed', error.message)
  } finally { measuringSelected.value = false }
}
function clearSelectedProbe() {
  if (!selectedServer.value || measurementBusy.value) return
  const id = selectedServer.value.id
  comparePoints.value = comparePoints.value.map(point => point.id === id ? { ...point, probeUrl:'', measurement:undefined } : point)
  probeDraft.value = ''
  writeActivity('INFO', 'consoleProbeRemoved', selectedServer.value?.ip || '')
}
async function measureAllProbes() {
  if (measurementBusy.value) return
  const ids = comparePoints.value.filter(point => point.id !== rankingSourceId.value && !point.demoGroup && probeMatchesPoint(point, point.probeUrl)).map(point => point.id)
  if (!ids.length) return showToast(t('noProbes'))
  measuringAll.value = true
  measureProgress.value = 0
  measureTotal.value = ids.length
  rankingBasis.value = 'browser'
  writeActivity('WAIT', 'consoleMeasureAllStarted', String(ids.length))
  let nextIndex = 0
  let failures = 0
  async function worker() {
    while (nextIndex < ids.length) {
      const id = ids[nextIndex++]
      try { if (!await measurePointById(id)) failures += 1 }
      catch { failures += 1 }
      finally { measureProgress.value += 1 }
    }
  }
  try { await Promise.all([worker(), worker()]) }
  finally { measuringAll.value = false }
  showToast(failures ? t('measurementPartial') : t('measurementComplete'))
  writeActivity(failures ? 'ERROR' : 'OK', failures ? 'consoleMeasureAllPartial' : 'consoleMeasureAllFinished', `${ids.length - failures}/${ids.length}`)
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

function exportRanking(format) {
  if (!serverRanking.value.length || measurementBusy.value) return
  const generated = new Date().toISOString()
  const rows = serverRanking.value.map(server => ({
    rank:server.rank, ip:server.ip, target:server.target || server.host || server.ip,
    city:server.city_name, country:server.country_code, basis:rankingBasis.value,
    score:server.eligible ? Number(server.score.toFixed(1)) : null,
    reference_ip:rankingSource.value.ip, distance_km:Math.round(server.distance),
    measurement_kind:server.measurement?.kind || 'none',
    measurement_origin:server.measurement?.vantage || 'none',
    http_median_ms:server.measurement?.latency ?? null,
    successful:server.measurement?.successful ?? 0, attempted:server.measurement?.attempts ?? 0,
    measured_at:server.measurement?.measuredAt || '', probe_url:server.probeUrl || '',
    network_type:server.usage_type || '', network_score:server.networkScore,
    primary_contribution:server.components[0].contribution, network_contribution:server.components[1].contribution,
    geographic_data_source:server.source, generated_at:generated
  }))
  if (format === 'json') {
    downloadFile('geoip2route-ranking.json', JSON.stringify({
      version:'1.8.0', generated_at:generated, basis:rankingBasis.value,
      geographic_reference:rankingSource.value,
      formula:rankingBasis.value === 'geo' ? '0.8 * distance_score + 0.2 * network_score' : '0.8 * http_score + 0.2 * network_score',
      note:'HTTP is measured from this browser, not from the geographic reference. Simulated and browser measurements are never mixed in scoring.',
      candidates:rows.map((row,index) => ({ ...row, measurement:serverRanking.value[index].measurement || null, components:serverRanking.value[index].components }))
    }, null, 2), 'application/json')
    writeActivity('OK', 'consoleExported', 'JSON')
    return
  }
  const headers = Object.keys(rows[0])
  const csv = [headers.map(csvCell).join(','), ...rows.map(row => headers.map(key => csvCell(row[key])).join(','))].join('\n')
  downloadFile('geoip2route-ranking.csv', '\uFEFF' + csv, 'text/csv;charset=utf-8')
  writeActivity('OK', 'consoleExported', 'CSV')
}

function bundledSampleClient(sample) {
  const region = typeof sample.region === 'object' ? sample.region[language.value] || sample.region.en : sample.region
  const isp = typeof sample.isp === 'object' ? sample.isp[language.value] || sample.isp.en : sample.isp
  return {
    ip: sample.ip,
    country_code: sample.countryCode,
    country_name: sample.country[language.value],
    region_name: region,
    city_name: sample.city[language.value],
    latitude: sample.latitude,
    longitude: sample.longitude,
    zip_code: '',
    time_zone: sample.timeZone || '',
    asn: 'SAMPLE',
    as: isp,
    isp,
    usage_type: 'ISP',
    source: 'sample'
  }
}

function localizeDemoPoint(point, value = language.value) {
  return { ...point, ...(point.localized?.[value] || {}) }
}

function bundledComparePoint(sample) {
  return {
    ...bundledSampleClient(sample),
    id: sample.id,
    country_name: sample.country[language.value],
    city_name: sample.city[language.value],
    sampleLabel: sample.city.en,
    custom: false
  }
}

function compareMarkerLabel(id, index) {
  const selectedIndex = selectedCompareIds.value.indexOf(id)
  return selectedIndex === 0 ? 'A' : selectedIndex === 1 ? 'B' : String(index + 1)
}

function compareMarkerClass(id) {
  const selectedIndex = selectedCompareIds.value.indexOf(id)
  return selectedIndex === 0 ? 'point-a' : selectedIndex === 1 ? 'point-b' : ''
}

function selectComparePoint(id) {
  const current = selectedCompareIds.value
  const point = comparePoints.value.find(item => item.id === id)
  if (current.includes(id)) {
    selectedCompareIds.value = current.filter(item => item !== id)
    writeActivity('INFO', 'consolePointDeselected', point?.ip || '')
    return
  }
  selectedCompareIds.value = current.length < 2 ? [...current, id] : [current[0], id]
  writeActivity('INFO', selectedCompareIds.value.indexOf(id) === 0 ? 'consolePointSelectedA' : 'consolePointSelectedB', point?.ip || '')
}

function applyPointResult(result) {
  const selection = remapPointSelection(result, {
    selectedCompareIds:selectedCompareIds.value,
    rankingSourceId:rankingSourceId.value,
    selectedServerId:selectedServerId.value
  })
  comparePoints.value = result.points
  selectedCompareIds.value = selection.selectedCompareIds
  rankingSourceId.value = selection.rankingSourceId
  selectedServerId.value = selection.selectedServerId
  return result
}

function commitPoints(points) { return applyPointResult(deduplicatePoints(points)) }

async function refreshComparePoints() {
  if (syncingCompare.value || addingCurrentIp.value || measurementBusy.value || !compareRefreshTotal.value) return
  syncingCompare.value = true
  compareProgress.value = 0
  let failures = 0
  const pointsToRefresh = comparePoints.value.filter(point => !point.demoGroup)
  refreshTotal.value = pointsToRefresh.length
  writeActivity('WAIT', 'consoleRefreshStarted', String(refreshTotal.value))
  const resolved = new Array(pointsToRefresh.length)
  let nextIndex = 0

  async function worker() {
    while (nextIndex < pointsToRefresh.length) {
      const index = nextIndex
      nextIndex += 1
      const point = pointsToRefresh[index]
      try {
        const location = await lookupTarget(point.target || point.host || point.ip)
        resolved[index] = { ...point, ...location, id: point.id, sampleLabel: point.sampleLabel || '', custom: point.custom }
        writeActivity('OK', 'consoleLookupFinished', `${compareProgress.value + 1}/${refreshTotal.value} · ${location.ip}`)
      } catch (error) {
        failures += 1
        resolved[index] = point
        writeActivity('ERROR', 'consoleLookupFailed', `${compareProgress.value + 1}/${refreshTotal.value} · ${point.ip} · ${error.message || ''}`)
      } finally {
        compareProgress.value += 1
      }
    }
  }

  await Promise.all([worker(), worker(), worker()])
  const updates = new Map(resolved.filter(Boolean).map(point => [point.id, point]))
  const result = commitPoints(comparePoints.value.map(point => updates.has(point.id) ? { ...point, ...updates.get(point.id) } : point))
  syncingCompare.value = false
  showToast(`${t(failures ? 'partialUpdate' : 'updateComplete')}${result.mergedCount ? ` · ${t('duplicatesMerged')}: ${result.mergedCount}` : ''}`)
  writeActivity(failures ? 'ERROR' : 'OK', failures ? 'consoleRefreshPartial' : 'consoleRefreshFinished', `${pointsToRefresh.length - failures}/${pointsToRefresh.length}${result.mergedCount ? ` · ${t('duplicatesMerged')}: ${result.mergedCount}` : ''}`)
}

async function addCurrentIp() {
  if (addingCurrentIp.value || syncingCompare.value || bulkLoading.value || addingComparePoint.value || measurementBusy.value) return
  addingCurrentIp.value = true
  currentIpError.value = ''
  currentIpNotice.value = ''
  writeActivity('WAIT', 'consoleCurrentIpStarted')
  try {
    const location = await getCurrentLocation()
    const result = mergeCurrentIp(comparePoints.value, location, `current-${Date.now()}`)
    applyPointResult(result)
    client.value = {...location}
    const other = selectedCompareIds.value.find(id => id !== result.id && result.points.some(point => point.id === id)) || result.points.find(point => point.id !== result.id)?.id
    selectedCompareIds.value = [result.id, ...(other ? [other] : [])]
    if (rankingBasis.value === 'demo') rankingBasis.value = 'geo'
    rankingSourceId.value = result.id
    currentIpNotice.value = `${t(result.existed ? 'currentIpUpdated' : 'currentIpAdded')}: ${location.ip}. ${t(location.detection_source === 'development_host' ? 'currentIpDevNote' : 'currentIpProxyNote')}`
    showToast(t(result.existed ? 'currentIpUpdated' : 'currentIpAdded'))
    writeActivity('OK', result.existed ? 'consoleCurrentIpUpdated' : 'consoleCurrentIpAdded', location.ip)
  } catch (error) {
    currentIpError.value = error.message || t('currentIpFailed')
    writeActivity('ERROR', 'consoleCurrentIpFailed', currentIpError.value)
  } finally {
    addingCurrentIp.value = false
  }
}

async function addComparePoint() {
  if (!compareTarget.value || addingComparePoint.value || addingCurrentIp.value) return
  addingComparePoint.value = true
  try {
    const target = normalizeTarget(compareTarget.value)
    if (!target) throw new Error(t('noValidTargets'))
    writeActivity('WAIT', 'consoleLookupStarted', target)
    const location = await lookupTarget(target)
    const existing = comparePoints.value.find(point => sameIp(point.ip, location.ip))
    if (existing) {
      // Preserve an existing probe's hostname when an alias resolves to this IP.
      commitPoints(comparePoints.value.map(point => point.id === existing.id ? { ...point, ...location, target:point.probeUrl ? point.target : target, host:point.probeUrl ? point.host : location.host } : point))
      if (appMode.value === 'compare' && !selectedCompareIds.value.includes(existing.id)) selectComparePoint(existing.id)
      else if (existing.id !== rankingSourceId.value) selectedServerId.value = existing.id
    } else {
      const point = { ...location, target, id: `compare-${Date.now()}`, custom: true }
      commitPoints([...comparePoints.value, point])
      if (!rankingSourceId.value) rankingSourceId.value = point.id
      if (appMode.value === 'compare') selectComparePoint(point.id)
      else if (point.id !== rankingSourceId.value) selectedServerId.value = point.id
    }
    compareTarget.value = ''
    showToast(t(existing ? 'duplicateIpUpdated' : 'addedToMap'))
    writeActivity('OK', existing ? 'consoleDuplicateUpdated' : 'consoleIpAdded', location.ip)
  } catch (error) {
    showToast(error.message)
    writeActivity('ERROR', 'consoleLookupFailed', error.message)
  } finally {
    addingComparePoint.value = false
  }
}

function removeComparePoint(id) {
  const removed = comparePoints.value.find(point => point.id === id)
  const remaining = comparePoints.value.filter(point => point.id !== id)
  comparePoints.value = remaining
  selectedCompareIds.value = selectedCompareIds.value.filter(pointId => pointId !== id)
  if (rankingSourceId.value === id) rankingSourceId.value = remaining[0]?.id || ''
  if (selectedServerId.value === id) selectedServerId.value = remaining.find(point => point.id !== rankingSourceId.value)?.id || ''
  showToast(t('ipRemoved'))
  writeActivity('INFO', 'consoleIpRemoved', removed?.ip || '')
}

function serverRankFor(id) { return serverRanking.value.find(point => point.id === id) }
function serverScoreLabel(score) { return score >= 85 ? 'excellent' : score >= 70 ? 'good' : score >= 50 ? 'fair' : 'poor' }


function openCsvPicker() {
  if (!csvInput.value) return
  rememberModalTrigger()
  csvInput.value.value = ''
  csvInput.value.click()
}

async function handleCsvFile(event) {
  const file = event.target.files?.[0]
  if (!file) return
  bulkInput.value = ''
  bulkMode.value = 'append'
  bulkSourceName.value = file.name
  csvInspecting.value = true
  showBulk.value = true
  await nextTick()
  bulkDialog.value?.focus()
  try {
    if (file.size > 1024 * 1024) throw new Error('Maximum file size: 1 MiB')
    const text = await file.text()
    bulkInput.value = text
    csvInspecting.value = false
    await nextTick()
    bulkFirstControl.value?.focus()
    const inspection = inspectCsvPattern(text)
    writeActivity('INFO', 'consoleCsvLoaded', `${file.name} · ${inspection.recordCount}/${inspection.dataRowCount}`)
    if (!inspection.canImport) showToast(t('csvSchemaInvalid'))
  } catch (error) {
    showBulk.value = false
    bulkSourceName.value = ''
    showToast(error.message)
    writeActivity('ERROR', 'consoleCsvFailed', error.message)
    restoreModalFocus()
  } finally {
    csvInspecting.value = false
  }
}

async function addBulkPoints() {
  if (addingCurrentIp.value) return
  let records
  try { records = parseTargetRecords(bulkInput.value) }
  catch (error) { return showToast(error.message) }
  if (!records.length || bulkLoading.value) {
    if (!records.length) showToast(t('noValidTargets'))
    return
  }

  bulkLoading.value = true
  const importMode = bulkMode.value
  bulkProgress.value = 0
  bulkTotal.value = records.length
  writeActivity('WAIT', 'consoleBulkStarted', String(records.length))
  let failures = 0
  let nextIndex = 0
  const located = new Array(records.length)

  async function worker() {
    while (nextIndex < records.length) {
      const index = nextIndex
      nextIndex += 1
      try {
        const location = await lookupTarget(records[index].target)
        located[index] = { ...location, target: records[index].target, probeUrl: records[index].probeUrl }
        writeActivity('OK', 'consoleLookupFinished', `${bulkProgress.value + 1}/${bulkTotal.value} · ${location.ip}`)
      } catch (error) {
        failures += 1
        writeActivity('ERROR', 'consoleLookupFailed', `${bulkProgress.value + 1}/${bulkTotal.value} · ${records[index].target} · ${error.message || ''}`)
      } finally {
        bulkProgress.value += 1
      }
    }
  }

  await Promise.all([worker(), worker(), worker()])
  const successful = located.filter(Boolean)
  if (importMode === 'replace' && !successful.length) {
    bulkLoading.value = false
    showToast(t('bulkReplaceAborted'))
    writeActivity('ERROR', 'consoleBulkPartial', `0/${records.length} · ${t('existingListKept')}`)
    return
  }
  const merged = importMode === 'replace' ? [] : [...comparePoints.value]
  successful.forEach((point, index) => {
    const existingIndex = merged.findIndex(item => sameIp(item.ip, point.ip))
    if (existingIndex < 0) merged.push({ ...point, id:`bulk-${Date.now()}-${index}`, custom:true })
    else if (point.probeUrl) merged[existingIndex] = { ...merged[existingIndex], ...point, measurement:undefined }
  })
  const result = commitPoints(merged)
  if (!rankingSourceId.value) rankingSourceId.value = comparePoints.value[0]?.id || ''
  if (selectedCompareIds.value.length < 2) selectedCompareIds.value = comparePoints.value.slice(0, 2).map(point => point.id)
  bulkLoading.value = false
  showBulk.value = false
  if (typeof restoreModalFocus === 'function') restoreModalFocus()
  bulkInput.value = ''
  bulkSourceName.value = ''
  const completionMessage = importMode === 'replace'
    ? (failures ? t('bulkReplacePartial') : t('bulkReplaceComplete'))
    : (failures ? t('bulkPartial') : t('bulkComplete'))
  showToast(completionMessage)
  writeActivity(failures ? 'ERROR' : 'OK', failures ? 'consoleBulkPartial' : 'consoleBulkFinished', `${records.length - failures}/${records.length} · ${t(importMode === 'replace' ? 'replaceExisting' : 'appendExisting')}${result.mergedCount ? ` · ${t('duplicatesMerged')}: ${result.mergedCount}` : ''}`)
}

watch(language, value => {
  localStorage.setItem('sakura-language', value)
  document.documentElement.lang = value
  comparePoints.value = comparePoints.value.map(point => {
    if (point.demoGroup) return localizeDemoPoint(point, value)
    const sample = sampleClients.find(item => item.id === point.id)
    return sample && point.source !== 'ip2location'
      ? { ...point, country_name: sample.country[value], region_name: typeof sample.region === 'object' ? sample.region[value] || sample.region.en : sample.region, city_name: sample.city[value], isp: typeof sample.isp === 'object' ? sample.isp[value] || sample.isp.en : sample.isp, as: typeof sample.isp === 'object' ? sample.isp[value] || sample.isp.en : sample.isp }
      : point
  })
})
watch(themeMode, value => localStorage.setItem('sakura-theme', value))
watch(appMode, value => localStorage.setItem('sakura-app-mode', value))
watch(consoleOpen, value => localStorage.setItem('sakura-console-open', String(value)))
watch(rankingBasis, value => {
  if (value === 'demo') rankingSourceId.value = comparePoints.value.find(point => point.id === 'demo-th')?.id || comparePoints.value.find(point => point.demoGroup)?.id || ''
})
watch(rankingSourceId, () => {
  if (!serverRanking.value.some(point => point.id === selectedServerId.value)) selectedServerId.value = serverRanking.value[0]?.id || ''
})
watch(() => selectedServer.value?.id, id => {
  probeDraft.value = comparePoints.value.find(point => point.id === id)?.probeUrl || ''
  probeError.value = ''
}, { immediate: true })

onMounted(() => {
  document.documentElement.lang = language.value
  clockTimer = setInterval(() => { now.value = new Date() }, 1000)
  writeActivity('INFO', 'consoleReady')
})
onBeforeUnmount(() => { clearInterval(clockTimer); clearTimeout(toastTimer) })
</script>
