library(shiny)
library(shinydashboard)
library(dplyr)
library(readr)
library(jsonlite)
library(DT)
library(httr)

default_shipper_id = 1
#default_rest_addr = "http://270ee3ab.ngrok.io/"
default_rest_addr = "http://d3a08598.ngrok.io/"

#---------------------------- API Names for shipper------------------------

api_shipper_profile = "containerguy"
api_create_job_offer = "createContainerDeliveryJobOffer"
api_create_container_info = "createContainerInfo"
api_container_history = "allContainersOf"
api_accept_delivery = "acceptDelivery"
api_get_bids = "getTruckerBids"
api_job_offers_history = "byId"
api_cancel_bid = "cancelBid"
api_accept_bid = "acceptBid"
path_contracts = "ContainerDeliveryJob"
path_job_offers = "ContainerDeliveryJobOffer"
api_raise_exception = "raiseException"
api_initialization = "test/initnetwork"

# router.get('/allContainersOf/:containerGuyId', (req, res) => {
#   const containerGuyId = req.params.containerGuyId;
# });
# 
# router.post('/createContainerDeliveryJobOffer', (req, res) => {
#   new ContainerDeliveryJobOfferService()
# });
# 
# router.post('/createContainerInfo', (req, res) => {
#   new ContainerDeliveryJobOfferService()
# });
# 
# router.post('/acceptDelivery/:containerDeliveryJobId', (req, res) => {
#   const containerDeliveryJobId = req.params.containerDeliveryJobId;
# });
# 
# router.get('/:containerDeliveryJobOfferId/getTruckerBids', (req, res) => {
#   const containerDeliveryJobOfferId = req.params.containerDeliveryJobOfferId;
# });
# 
# router.get('/byId/:id', (req, res) => {
#   const id = req.params.id;
# });
# 
# router.post("/:containerDeliveryJobOfferId/cancelBid/:truckerBidId", (req, res) => {
#   const containerDeliveryJobOfferId = req.params.containerDeliveryJobOfferId;
#   const truckerBidId = req.params.truckerBidId;
# });
# 
# router.post("/:containerDeliveryJobOfferId/acceptBid/:truckerBidId", (req, res) => {
#   const containerDeliveryJobOfferId = req.params.containerDeliveryJobOfferId;
#   const truckerBidId = req.params.truckerBidId;
# });
# 
# router.get('/:containerDeliveryJobId', (req, res) => {
#   const containerDeliveryJobId = req.params.containerDeliveryJobId;
# });
# 
# router.post('/:containerDeliveryJobId/raiseException/:details', (req, res) => {
#   const containerDeliveryJobId = req.params.containerDeliveryJobId;
#   const details = req.params.details;
# });




##======================================Layout=============================================

ui <- dashboardPage(skin = "green",
                    
                    dashboardHeader(title = 'Shipper UI', titleWidth = 250),
                    
                    dashboardSidebar(width = 250,
                                     sidebarMenu(
                                       menuItem("Create & view requests", tabName = "requestTruck", 
                                                icon = icon("home")),
                                       menuItem("View & accept bids", tabName = "viewBids", 
                                                icon = icon("free-code-camp")),
                                       menuItem("Track & update contracts", tabName = "viewContracts", 
                                                icon = icon("area-chart")),
                                       menuItem("My Profile", tabName = "profile", 
                                                icon = icon("address-card-o"))
                                     )
                    ),
                    
                    dashboardBody(
                      tabItems(
                        tabItem(tabName = "requestTruck",
                                mainPanel(
                                  tabsetPanel(type = "tabs",
                                              tabPanel("Create Request", 
                                                       fluidRow(width = 12, #status = "info",
                                                                # column(width = 4,
                                                                #        radioButtons("rt_exim", "", choices = list(
                                                                #          "Import" = "IMP",	
                                                                #          "Export" = "EXP"),
                                                                #          selected = "IMP")
                                                                # ),
                                                                column(width = 4,
                                                                       selectInput("rt_terminal", "Terminal", c(
                                                                         "RWG",	
                                                                         "ECT",
                                                                         "APMII"
                                                                       )),
                                                                       textInput("rt_postcode", "Postcode", 
                                                                                 value = "")
                                                                ),
                                                                column(width = 4,
                                                                       dateInput("rt_date", 
                                                                                 "Date", 
                                                                                 value = "2018-01-30"),
                                                                       selectInput("rt_slot", "Slot", c(
                                                                         "00:00 - 06:00",
                                                                         "06:00 - 12:00",
                                                                         "12:00 - 18:00",
                                                                         "18:00 - 00:00"
                                                                       ))
                                                                )
                                                       ),
                                                       fluidRow(width = 12, #status = "info",
                                                                column(width = 4,
                                                                       
                                                                       radioButtons("rt_cntnrType", "Container Type",
                                                                                    choices = list("20GP", "22TD",
                                                                                                   "42GP", "45GP"),selected = "20GP"),
                                                                       checkboxInput("rt_loaded", "Loaded", value = TRUE),
                                                                       checkboxInput("rt_adr", "ADR", value = FALSE)
                                                                ),
                                                                column(width = 4,
                                                                       textInput("rt_cntnrNum", "Container Number", 
                                                                                 value = "Enter text..."),
                                                                       textInput("rt_cntnrAddr", "Delivery Notes", 
                                                                                 value = "Enter text...")
                                                                ),
                                                                column(width = 4,
                                                                       selectInput("rt_contract", "Contract Type", c(
                                                                         "Import" = "IMP",	
                                                                         "Export" = "EXP"),
                                                                         selected = "IMP"),
                                                                       actionButton("rt_submit", "Submit Request!"),
                                                                       verbatimTextOutput("rt_create_job_offer_status")
                                                                       
                                                                )
                                                       )
                                              ),
                                              tabPanel("Manage Requests", 
                                                       br(),
                                                       fluidRow(width = 12, status = "info",
                                                                column(width = 4,
                                                                       selectInput("rt_filter", "Request types:", choices = list(
                                                                         "Open" = 0,	
                                                                         "Cancelled" = 1,	
                                                                         "Contracted" = 2,
                                                                         "All" = 3),
                                                                         selected = "Accept")
                                                                ),
                                                                column(width = 5,
                                                                       verbatimTextOutput("rt_request_details")
                                                                ),
                                                                column(width = 3,
                                                                       selectInput("rt_command", "", choices = list(
                                                                         "None" = 0,	
                                                                         "Cancel" = 1,	
                                                                         "View Bids" = 2,
                                                                         "View Contract" = 3),
                                                                         selected = "Cancel"),
                                                                       actionButton("rt_submit", "Submit"),
                                                                       actionButton("rt_update", "Refresh")
                                                                )
                                                       ),
                                                       dataTableOutput("rt_requestsTable")
                                              )
                                  )
                                )
                                
                        ),
                        
                        tabItem(tabName = "viewBids",
                                fluidRow(width = 12, status = "info",
                                         column(width = 4,
                                                uiOutput("vb_filters")
                                         ),
                                         column(width = 5,
                                                verbatimTextOutput("vb_bid_details")
                                         ),
                                         column(width = 3,
                                                actionButton("vb_accept_bid", "Accept Bid"),
                                                br(),
                                                verbatimTextOutput("vb_accept_bid_status")
                                         )
                                ),
                                dataTableOutput("vb_bidsTable")
                        ),
                        tabItem(tabName = "viewContracts",
                                fluidRow(width = 12, status = "info",
                                         column(width = 4,
                                                selectInput("vc_filter", "Contract types:", choices = list(
                                                  "Under Process" = 0,
                                                  "Settled" = 1,
                                                  "Exception Raised" = 2),
                                                  selected = "Under Process")
                                         ),
                                         column(width = 5,
                                                verbatimTextOutput("vc_contract_details")
                                         ),
                                         column(width = 3,
                                                selectInput("vc_command", "", choices = list(
                                                  "Make container available for pickup" = 0,
                                                  "Acknowledge delivery" = 2,
                                                  "Raise exception" = 3),
                                                  selected = 0),
                                                actionButton("vc_submit", "Submit")
                                         )
                                ),
                                dataTableOutput("vc_contractsTable")
                        ),
                        tabItem(tabName = "profile",
                                #p("I am a very good shipper.")
                                box(width = 12, status = "info", title = "Connection profile",
                                    verbatimTextOutput("pr_rest_details"),
                                    textInput("pr_rest_addr", "REST Server Address:",
                                              value = default_rest_addr),
                                    actionButton("pr_update_rest", "Update")
                                ),
                                box(width = 12, status = "info", title = "My profile",
                                    verbatimTextOutput("pr_shipper_details"),
                                    textInput("pr_shipper_id", "My ID:",
                                              value = default_shipper_id),
                                    actionButton("pr_update_id", "Update")
                                )
                        )
                      )
                    )
)

server <- function(input, output) {
  #================================= Reactive values ========================================
  profileInfo <- reactiveValues(
    rest_addr = default_rest_addr,
    rest_status = "Unknown",
    shipper_id = default_shipper_id,
    accept_bid_status = "",
    cancel_bid_status = "",
    raise_exception_status = "",
    create_job_offer_status = "",
    create_container_info_status = ""
  )
  
  datasets <- reactiveValues(
    requests = read_csv2("requests.csv"),
    bids = read_csv2("bids.csv"),
    contracts = read_csv2("contracts.csv"),
    contract_updates = read_csv2("contract_updates.csv")
  )
  
  ##================================== Create and view requests ================================
  
  ##-----------------Request------------
  
  observeEvent(input$rt_submit, {
    isolate({
      new_req = c(nrow(datasets$requests) + 1, as.character(input$rt_date), input$rt_cntnrNum,
                  input$rt_cntnrType, input$rt_adr, input$rt_exim, input$rt_loaded, 
                  input$rt_terminal, input$rt_postcode, input$rt_slot, input$rt_contract, 
                  0, 1, 1, 1)
      create_container_info_status <- as.character(POST(paste0(profileInfo$rest_addr, api_shipper_profile, "/", api_create_container_info),
                                                        body = list(containerId = 765, #nrow(datasets$requests) + 1,
                                                                    owner = 1, #"resource:nl.tudelft.blockchain.logistics.ContainerGuy#1",
                                                                    containerType = "BasicContainer",
                                                                    containerSize = "TWENTY"
                                                        ),
                                                        encode = "json"))
      profileInfo$create_container_info_status = create_container_info_status
      
      create_job_offer_status <- as.character(POST(paste0(profileInfo$rest_addr, api_shipper_profile, "/", api_create_job_offer),
                                                   body = list(containerDeliveryJobOfferId = 1234,
                                                               containerGuyId= 1,
                                                               containerInfo= 765), #"resource:nl.tudelft.blockchain.logistics.ContainerInfo#765"),
                                                   encode = "json"))
      profileInfo$create_job_offer_status = create_job_offer_status
    })
  })
  
  observeEvent(
    input$rt_terminal, 
    isolate({
      profileInfo$create_container_info_status = ""
      profileInfo$create_job_offer_status = ""
    })
  )
  
  output$rt_create_job_offer_status = renderPrint({
    #input$vr_requestsTable_rows_selected
    cat(profileInfo$create_container_info_status)
    cat("\n\n")
    cat(profileInfo$create_job_offer_status)
  })
  
  ##-----------------Manage---------------
  
  output$rt_request_details = renderPrint({
    container_history = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, api_shipper_profile, "/", 
                                                      api_container_history,"/", profileInfo$shipper_id)))
    s <- container_history$containerDeliveryJobOfferId[input$rt_requestsTable_rows_selected]
    if (length(s)) {
      cat('Request', s, 'has been selected.\n\n')
      #cat('Request details are as follows:\n')
    }
  })
  
  output$rt_requestsTable <- DT::renderDataTable(server = TRUE,
                                                 selection = 'single',
                                                 extensions = "Buttons", 
                                                 options = list(#paging = FALSE,
                                                   stringsAsFactors = FALSE,
                                                   dom = "Bfrtip", 
                                                   buttons = list('copy', 'pdf', 'csv', 'excel', 'print')),
                                                 {
                                                   #input$rt_submit
                                                   input$rt_update
                                                   #datasets$requests[,1:12]
                                                   container_history = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, api_shipper_profile, "/", 
                                                                                              api_container_history,"/", profileInfo$shipper_id)))
                                                   container_history
                                                 }
  )
  
  ##================================== View and accept Bids ====================================
  
  
  output$vb_filters <- renderUI({
    #requestIDs <- unique(datasets$bids$Container_Id)
    requestIDs = unique(as.data.frame(fromJSON(paste0(profileInfo$rest_addr, api_shipper_profile, "/", 
                                                      api_container_history,"/", profileInfo$shipper_id)))$containerDeliveryJobOfferId)
    selectInput("vb_cntnrID", "Select Request ID:", requestIDs)
  })
  
  output$vb_bid_details = renderPrint({
    bids_table = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, path_job_offers, "/", 
                                               input$vb_cntnrID,"/", api_get_bids)))
    s <- bids_table$truckerBidId[input$vb_bidsTable_rows_selected]
    #s = input$vb_bidsTable_rows_selected
    if (length(s)) {
      cat('Bid', s, 'has been selected.\n\n')
      #cat('Bid details are as follows:\n')
    }
  })
  
  
  output$vb_bidsTable <- DT::renderDataTable(server = TRUE,
                                             selection = 'single',
                                             extensions = "Buttons", 
                                             options = list(#paging = FALSE,
                                               stringsAsFactors = FALSE,
                                               dom = "Bfrtip", 
                                               buttons = list('copy', 'pdf', 'csv', 'excel', 'print')),
                                             {
                                               input$vb_cntnrID
                                               #filter(isolate(datasets$bids), Container_Id == input$vb_cntnrID)
                                               bids_table = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, path_job_offers, "/", 
                                                                                          input$vb_cntnrID,"/", api_get_bids)))
                                               bids_table
                                             }
  )
  
  observeEvent(
    input$vb_accept_bid, 
    isolate({
      bids_table = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, path_job_offers, "/", 
                                                 input$vb_cntnrID,"/", api_get_bids)))
      bid_Id <- bids_table$truckerBidId[input$vb_bidsTable_rows_selected]
      # router.post("/:containerDeliveryJobOfferId/acceptBid/:truckerBidId", (req, res) => {
      request_Id <- input$vb_cntnrID
      bid_acceptance_status <- as.character(POST(paste0(profileInfo$rest_addr, path_job_offers, "/", request_Id, "/",
                                                        api_accept_bid, "/", bid_Id, "/",
                                                        bid_Id)))
      profileInfo$accept_bid_status = bid_acceptance_status
    })
  )
  
  observeEvent(
    input$vb_bidsTable_rows_selected, 
    isolate({
      profileInfo$accept_bid_status = ""
    })
  )
  
  output$vb_accept_bid_status = renderPrint({
    #input$vr_requestsTable_rows_selected
    cat(profileInfo$accept_bid_status)
  })
  
  ##=============================== Track and update contracts =============================
  
  
  output$vc_contract_details = renderPrint({
    s = input$vc_contractsTable_rows_selected
    if (length(s)) {
      cat('Contract', s, 'has been selected.\n\n')
      #cat('Contract details are as follows:\n')
    }
  })
  
  
  
  output$vc_contractsTable <- DT::renderDataTable(server = TRUE,
                                                  selection = 'single',
                                                  extensions = "Buttons", 
                                                  options = list( #paging = FALSE,
                                                    stringsAsFactors = FALSE,
                                                    dom = "Bfrtip", 
                                                    buttons = list('copy', 'pdf', 'csv', 'excel', 'print')),
                                                  {
                                                    #dummy_data <- as.data.frame(fromJSON("http://d7a0a093.ngrok.io/trucker/preferences/1"))
                                                    #dummy_data
                                                    #datasets$contracts
                                                    #contracts_table = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, path_job_offers, "/", 
                                                    #                                           input$vb_cntnrID,"/", api_get_bids)))
                                                    #bids_table
                                                  }
  )
  
  
  
  ##==================================Profile================================================
  
  output$pr_rest_details <- renderPrint({
    isolate({
      addr = profileInfo$rest_addr
      #profileInfo$rest_status <- as.character(fromJSON(paste0(profileInfo$rest_addr, api_initialization)))
      if (length(addr)) {
        cat('REST Server: ', addr, '\n\n')
        #cat('Connection Status: ', profileInfo$rest_status, '\n')
      }
    })
  })
  
  observeEvent(input$pr_update_rest, isolate(profileInfo$rest_addr <- input$pr_rest_addr))
  
  output$pr_shipper_details <- renderPrint({
    id = profileInfo$shipper_id
    #profile = as.character(fromJSON(paste0(profileInfo$rest_addr, api_shipper_profile, "/", profileInfo$shipper_id)))
    if (length(id)) {
      cat('Shipper ID: ', id, '\n\n')
      #cat(profile)
    }
  })
  
  observeEvent(input$pr_update_id, isolate(profileInfo$shipper_id <- input$pr_shipper_id))
  
}

##================================ Run the application =====================================
shinyApp(ui = ui, server = server)

