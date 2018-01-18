library(shiny)
library(shinydashboard)
library(dplyr)
library(readr)
library(jsonlite)
library(httr)
library(DT)

default_trucker_id = 1
default_rest_addr = "http://145.94.186.206:8081/"

#---------------------------- API Names for trucker------------------------

api_trucker_profile = "trucker" # GET POST PUT(id) DELETE(id) HEAD(id) GET(id)
#api_get_preferences = "preferences" # GET
#api_update_preferences = "updateTruckerPreferences"
api_bidding_history = "truckerBids" # GET(id)
api_accept_handover = "acceptDelivery"
api_place_bid = "submitBid"
api_cancel_bid = "cancelBid"
api_job_offers = "ContainerDeliveryJobOffer/containerDeliveryJobOffersForTrucker"
api_contracts = "ContainerDeliveryJob"
api_raise_exception = "raiseException"

# router.get('/preferences/:truckerId', (req, res) => (req.params.truckerId)
# 
# router.get('/truckerBids/:truckerId', (req, res) => (req.params.truckerId)
# 
# router.post('/updateTruckerPreferences', (req, res) =>
# {
#   let truckerId = req.body.truckerId;
#   let truckCapacity = req.body.truckCapacity;
#   let availableFrom = req.body.availableFrom;
#   let availableTo = req.body.availableTo;
#   let allowedDestinations = req.body.allowedDestinations;
# }
# 
# router.post('/acceptDelivery/:containerDeliveryJobId/:password', (req, res) => 
# {
#   const containerDeliveryJobId = req.params.containerDeliveryJobId;
#   const arrivalPassword = req.params.password;
# }
# 
# router.post("/:containerDeliveryJobOfferId/submitBid/:bidderId/:bidAmount", (req, res) => {
#   const containerDeliveryJobOfferId = req.params.containerDeliveryJobOfferId;
#   const bidderId = req.params.bidderId;
#   const bidAmount = req.params.bidAmount;
# }
# 
# router.get('/containerDeliveryJobOffersForTrucker/:truckerId', (req, res) => {
#   const truckerId = req.params.truckerId;
# }
# 
# router.get('/:containerDeliveryJobId', (req, res) => {
#   const containerDeliveryJobId = req.params.containerDeliveryJobId;
# }
# 
# router.post('/:containerDeliveryJobId/raiseException/:details', (req, res) => {
#   const containerDeliveryJobId = req.params.containerDeliveryJobId;
#   const details = req.params.details;
# }
# router.post("/:containerDeliveryJobOfferId/cancelBid/:truckerBidId", (req, res) => {
#   const containerDeliveryJobOfferId = req.params.containerDeliveryJobOfferId;
#   const truckerBidId = req.params.truckerBidId;
# }


#----------------------------Initialization---------------------------------------
api_initialization = "test/init"
POST(paste(default_rest_addr, "/", api_trucker_profile),
     body = list(truckerId = "1",
                 firstName = "A-one",
                 LastName = "Logistics",
                 adrTraining = "YES",
                 truckCapacity = "TWENTY",
                 availability = list(from = "2018-01-01", to = "2018-06-30"),
                 allowedDestinations = "Hague", "Amsterdam", "Hamburg"),
     encode = "json")
POST(paste(default_rest_addr, "/", api_trucker_profile),
     body = list(truckerId = "2",
                 firstName = "Prime",
                 LastName = "Movers",
                 adrTraining = "YES",
                 truckCapacity = "TWENTY",
                 availability = list(from = "2018-01-01", to = "2018-9-30"),
                 allowedDestinations = "Hague", "Amsterdam", "Groningen"),
     encode = "json")
POST(paste(default_rest_addr, "/", api_trucker_profile),
     body = list(truckerId = "3",
                 firstName = "Blade",
                 LastName = "Runners",
                 adrTraining = "YES",
                 truckCapacity = "FORTY",
                 availability = list(from = "2018-01-01", to = "2018-3-30"),
                 allowedDestinations = "Amsterdam", "Groningen", "Berlin", "Hamburg"),
     encode = "json")
init_status <- fromJSON(paste(default_rest_addr, api_initialization))

##======================================Layout=============================================

ui <- dashboardPage(skin = "blue",
                    
                    dashboardHeader(title = 'Trucker UI', titleWidth = 250),
                    
                    dashboardSidebar(width = 250,
                                     sidebarMenu(
                                       menuItem("View requests & place bids", tabName = "viewRequests", icon = icon("home")),
                                       menuItem("View & manage bids", tabName = "trackBids", icon = icon("free-code-camp")),
                                       menuItem("Track & update contracts", tabName = "viewContracts", icon = icon("area-chart")),
                                       menuItem("Profile", tabName = "profile", icon = icon("address-card-o"))
                                     )
                    ),
                    
                    dashboardBody(
                      tabItems(
                        tabItem(tabName = "viewRequests",
                                
                                box(width = 12, status = "info", title = "Available shipping requests",
                                    column(width = 4,
                                           radioButtons("vr_exim", "Destination type", choices = list(
                                             "Import" = "IMP",	
                                             "Export" = "EXP"),
                                             selected = "IMP"),
                                           radioButtons("vr_cntnrType", "Container Type",
                                                        choices = list("20GP", "22TD",
                                                                       "42GP", "45GP"),selected = "20GP")
                                    ),
                                    column(width = 4,   
                                           dateInput("vr_date", 
                                                     "Date", 
                                                     value = "2018-01-30"),
                                           selectInput("vr_slot", "Slot", c(
                                             "00:00 - 06:00",
                                             "06:00 - 12:00",
                                             "12:00 - 18:00",
                                             "18:00 - 00:00"
                                           ))
                                    ),
                                    column(width = 4,
                                           checkboxInput("vr_loaded", "Loaded", value = TRUE),
                                           checkboxInput("vr_adr", "ADR", value = FALSE)
                                    ),
                                    dataTableOutput("vr_requestsTable")
                                ),
                                box(width = 12, status = "primary", title = "Place bid",
                                    column(width = 6,
                                           verbatimTextOutput("vr_request_details")
                                    ),
                                    column(width = 3,
                                           numericInput("vr_bid_amount", "Bid amount", value=100)
                                    ),
                                    column(width = 3,
                                           br(),
                                           actionButton("vr_submit", "Bid")
                                    )
                                )
                        ),
                        
                        
                        tabItem(tabName = "trackBids",
                                box(width = 12, status = "info", title = "Status of bids made",
                                    selectInput("tb_filter", "Bid types:", choices = list(
                                      "All" = 0,
                                      "Accepted" = 1,
                                      "Rejected" = 2,
                                      "Open" = 3),
                                      selected = "All"),
                                    br(),
                                    dataTableOutput("tb_bidsTable")
                                    
                                ),
                                box(width = 12, status = "primary",
                                    column(width = 6,
                                           verbatimTextOutput("tb_bid_details")
                                    ),
                                    column(width = 3,
                                           br(),
                                           actionButton("tb_view_contract", "View Contract")
                                    ),
                                    column(width = 3,
                                           br(),
                                           actionButton("tb_cancel", "Cancel Bid")
                                    )
                                )
                        ),
                        tabItem(tabName = "viewContracts", 
                                box(width = 12, status = "info", title = "Contracts signed",
                                    selectInput("vc_filter", "Contract types:", choices = list(
                                      "Under Process" = 0,
                                      "Settled" = 1,
                                      "Exception Raised" = 2),
                                      selected = "Under Process"),
                                    dataTableOutput("vc_contractsTable")
                                ),
                                box(width = 12, status = "primary", title = "Update contracts",
                                    column(width = 6,
                                           verbatimTextOutput("vc_contract_details")
                                    ),
                                    column(width = 3,
                                           br(),
                                           actionButton("vc_pickup_truck", "Pickup container")
                                    ),
                                    column(width = 3,
                                           br(),
                                           actionButton("vc_raise_exception", "Raise exception")
                                    )
                                )
                        ),
                        tabItem(tabName = "profile",
                                box(width = 12, status = "info", title = "Connection profile",
                                    verbatimTextOutput("pr_rest_details"),
                                    textInput("pr_rest_addr", "REST Server Address:",
                                              value = default_rest_addr),
                                    actionButton("pr_update_rest", "Update")
                                ),
                                box(width = 12, status = "info", title = "My profile",
                                    verbatimTextOutput("pr_trucker_details"),
                                    textInput("pr_trucker_id", "My ID:",
                                              value = default_trucker_id),
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
    rest_status = TRUE,
    trucker_id = default_trucker_id
  )
  
  datasets <- reactiveValues(
    #requests = read_csv2("requests.csv"),
    requests = as.data.frame(fromJSON(paste(profileInfo$rest_addr, "/", api_job_offers, "/", profileInfo$trucker_id))),
    #bids = read_csv2("bids.csv"),
    bids = as.data.frame(fromJSON(paste(profileInfo$rest_addr, "/", api_bidding_history, "/", profileInfo$trucker_id))),
    #contracts = read_csv2("contracts.csv"),
    contracts = as.data.frame(fromJSON(paste(profileInfo$rest_addr, "/", api_contracts, "/", profileInfo$trucker_id)))
    #contract_updates = read_csv2("contract_updates.csv"),
  )
  
  ##================================== Create and view requests ================================
  
  
  
  output$vr_request_details = renderPrint({
    s = input$vr_requestsTable_rows_selected
    if (length(s)) {
      cat('Request', s, 'has been selected.\n\n')
      cat('Request details are as follows:\n')
    }
  })
  
  output$vr_requestsTable <- DT::renderDataTable(server = TRUE,
                                                 selection = 'single',
                                                 extensions = "Buttons", 
                                                 options = list(#paging = FALSE,
                                                   stringsAsFactors = FALSE,
                                                   dom = "Bfrtip", 
                                                   buttons = list('copy', 'pdf', 'csv', 'excel', 'print')),
                                                 {
                                                   datasets$requests
                                                 }
  )
  
  ##================================== View and manage Bids ====================================
  
  
  output$tb_bid_details = renderPrint({
    s = input$tb_bidsTable_rows_selected
    if (length(s)) {
      cat('Bid', s, 'has been selected.\n\n')
      cat('Bid details are as follows:\n')
    }
  })
  
  
  output$tb_bidsTable <- DT::renderDataTable(server = TRUE,
                                             selection = 'single',
                                             extensions = "Buttons", 
                                             options = list(#paging = FALSE,
                                               stringsAsFactors = FALSE,
                                               dom = "Bfrtip", 
                                               buttons = list('copy', 'pdf', 'csv', 'excel', 'print')),
                                             {
                                               datasets$bids
                                             }
  )
  
  ##=============================== Track and update contracts =============================
  
  
  output$vc_contract_details = renderPrint({
    s = input$vc_contractsTable_rows_selected
    if (length(s)) {
      cat('Contract', s, 'has been selected.\n\n')
      cat('Contract details are as follows:\n')
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
                                                    #dummy_data <- as.data.frame(fromJSON("http://145.94.186.206:8081/trucker/preferences/1"))
                                                    #dummy_data
                                                    datasets$contracts
                                                  }
  )
  
  
  ##==================================Profile================================================
  
  output$pr_rest_details <- renderPrint({
    s = datasets$rest_addr
    if (length(s)) {
      cat('REST Server: ', s, '\n\n')
      cat('Connection Status: ', datasets$rest_status, '\n')
    }
  })
  
  observeEvent(input$pr_update_rest, isolate(datasets$rest_addr <- input$pr_rest_addr))
  
  output$pr_trucker_details <- renderPrint({
    id = datasets$trucker_id
    profile = as.character(fromJSON(paste(profileInfo$rest_addr, "/", api_trucker_profile, "/", profileInfo$trucker_id)))
    if (length(id)) {
      cat('Trucker ID: ', id, '\n\n')
      cat(profile)
    }
  })
  
  observeEvent(input$pr_update_id, isolate(datasets$trucker_id <- input$pr_trucker_id))
  
}

##================================ Run the application =====================================
shinyApp(ui = ui, server = server)

