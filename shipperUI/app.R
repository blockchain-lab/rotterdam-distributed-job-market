library(shiny)
library(shinydashboard)
library(dplyr)
library(readr)
library(jsonlite)
library(DT)
library(httr)

bc_init_status <- fromJSON("http://145.94.186.206:8081/test/initnetwork")

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
                                                                column(width = 4,
                                                                       radioButtons("rt_exim", "", choices = list(
                                                                         "Import" = "IMP",	
                                                                         "Export" = "EXP"),
                                                                         selected = "IMP")
                                                                ),
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
                                                                       actionButton("rt_submit", "Submit Request!")
                                                                       
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
                                                selectInput("vb_command", "", choices = list(
                                                  "Accept" = 1,	
                                                  "Reject" = 2),
                                                  selected = "Accept"),
                                                actionButton("vb_submit", "Submit")
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
                                p("I am a very good shipper.")
                        )
                      )
                    )
)

server <- function(input, output) {
  #================================= Reactive values ========================================
  
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
      POST("http://145.94.186.206:8081/ContainerGuy/createContainerInfo",
          body = list(containerInfoId = nrow(datasets$requests) + 1),
          encode = "json")
      # POST("http://145.94.186.206:8081/ContainerGuy/createContainerDeliveryJobOffer",
      #     body = list(),
      #     encode = "json")
      datasets$requests[nrow(datasets$requests) + 1,] = new_req
    })
  })
  
  ##-----------------Manage---------------
  
  output$rt_request_details = renderPrint({
    s = input$rt_requestsTable_rows_selected
    if (length(s)) {
      cat('Request', s, 'has been selected.\n\n')
      cat('Request details are as follows:\n')
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
                                                   bc_data <- as.data.frame(fromJSON("http://145.94.186.206:8081/ContainerGuy/allContainersOf/1"))
                                                   bc_data
                                                   #datasets$requests[,1:12]
                                                 }
  )
  
  ##================================== View and accept Bids ====================================
  
  
  output$vb_filters <- renderUI({
    requestIDs <- unique(datasets$bids$Container_Id)
    selectInput("vb_cntnrID", "Select Request ID:", requestIDs)
  })
  
  output$vb_bid_details = renderPrint({
    s = input$vb_bidsTable_rows_selected
    if (length(s)) {
      cat('Bid', s, 'has been selected.\n\n')
      cat('Bid details are as follows:\n')
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
                                               filter(isolate(datasets$bids), Container_Id == input$vb_cntnrID)
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
                                                    dummy_data <- as.data.frame(fromJSON("http://d7a0a093.ngrok.io/trucker/preferences/1"))
                                                    dummy_data
                                                    #datasets$contracts
                                                  }
  )
  
}

##================================ Run the application =====================================
shinyApp(ui = ui, server = server)

