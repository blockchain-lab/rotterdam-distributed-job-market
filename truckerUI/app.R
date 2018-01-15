library(shiny)
library(shinydashboard)
library(dplyr)
library(readr)
library(jsonlite)
library(DT)

#dummy_data <- fromJSON("http://d7a0a093.ngrok.io/test/initnetwork")

##======================================Layout=============================================

ui <- dashboardPage(skin = "blue",
                    
                    dashboardHeader(title = 'Trucker UI', titleWidth = 250),
                    
                    dashboardSidebar(width = 250,
                                     sidebarMenu(
                                       menuItem("View requests & place bids", tabName = "viewRequests", icon = icon("home")),
                                       menuItem("View & manage bids", tabName = "trackBids", icon = icon("free-code-camp")),
                                       menuItem("Track & update contracts", tabName = "viewContracts", icon = icon("area-chart")),
                                       menuItem("My Profile", tabName = "profile", icon = icon("address-card-o"))
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
                                p("I am a very good trucker.")
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
                                                    #dummy_data <- as.data.frame(fromJSON("http://d7a0a093.ngrok.io/trucker/preferences/1"))
                                                    #dummy_data
                                                    datasets$contracts
                                                  }
  )
  
}

##================================ Run the application =====================================
shinyApp(ui = ui, server = server)

