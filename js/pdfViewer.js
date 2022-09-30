/* handles viewing pdf files using pdf.js. Recieves events from main.js will-download */

const webviews = require('webviews.js')
const urlParser = require('util/urlParser.js')

const PDFViewer = {
  url: {
    base: urlParser.getFileURL(__dirname + '/pages/pdfViewerFull/web/viewer.html'),
    queryString: '?file=%l'
  },
  isPDFViewer: function (tabId) {
    return tabs.get(tabId).url.startsWith(PDFViewer.url.base)
  },
  printPDF: function (viewerTabId) {
    if (!PDFViewer.isPDFViewer(viewerTabId)) {
      throw new Error("attempting to print in a tab that isn't a PDF viewer")
    }

    webviews.callAsync(tabs.getSelected(), 'executeJavaScript', 'parentProcessActions.printPDF()')
  },
  savePDF: function (viewerTabId) {
    if (!PDFViewer.isPDFViewer(viewerTabId)) {
      throw new Error("attempting to save in a tab that isn't a PDF viewer")
    }

    webviews.callAsync(tabs.getSelected(), 'executeJavaScript', 'parentProcessActions.downloadPDF()')
  },
  startFindInPage: function (viewerTabId) {
    if (!PDFViewer.isPDFViewer(viewerTabId)) {
      throw new Error("attempting to call startFindInPage in a tab that isn't a PDF viewer")
    }

    webviews.callAsync(tabs.getSelected(), 'executeJavaScript', 'parentProcessActions.startFindInPage()')
  },
  endFindInPage: function (viewerTabId) {
    if (!PDFViewer.isPDFViewer(viewerTabId)) {
      throw new Error("attempting to call endFindInPage in a tab that isn't a PDF viewer")
    }

    webviews.callAsync(tabs.getSelected(), 'executeJavaScript', 'parentProcessActions.endFindInPage()')
  },
  handlePDFOpenEvent: function (event, data) {
    if (!data.tabId) {
      var matchingTabs = tabs.get().filter(t => t.url === data.url).sort((a, b) => { return b.lastActivity - a.lastActivity })
      if (matchingTabs[0]) {
        data.tabId = matchingTabs[0].id
      }
    }
    if (!data.tabId) {
      console.warn('missing tab ID for PDF', data.url, tabs.get().map(t => t.url))
      return
    }
    var PDFurl = PDFViewer.url.base + PDFViewer.url.queryString.replace('%l', encodeURIComponent(data.url))
    webviews.update(data.tabId, PDFurl)
  },
  initialize: function () {
    ipc.on('openPDF', PDFViewer.handlePDFOpenEvent)
  }
}

module.exports = PDFViewer
