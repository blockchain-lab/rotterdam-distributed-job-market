library(shiny)
library(shinydashboard)
library(googleVis)
library(dplyr)
library(readr)
library(kableExtra)
library(knitr)
library(DT)

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
                                h3("Request truck"),
                                box(width = 12, status = "info",
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
                                box(status = "info",width = 12,
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
                                             "Type 1" = 1,	
                                             "Type 2" = 2,	
                                             "Type 3" = 3
                                           )),
                                           actionButton("rt_submit", "Submit Request!")
                                    )
                                ),
                                h3("View requests"),
                                dataTableOutput("rt_requestsTable")
                        ),
                        
                        tabItem(tabName = "viewBids",
                                uiOutput("vb_filters"),
                                dataTableOutput("vb_bidsTable")
                        ),
                        tabItem(tabName = "viewContracts",
                                tableOutput("vc_contractsTable")
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
  
  observeEvent(input$rt_submit, {
    isolate({
      new_req = c(nrow(datasets$requests) + 1, as.character(input$rt_date), input$rt_cntnrNum,
                  input$rt_cntnrType, input$rt_adr, input$rt_exim, input$rt_loaded, 
                  input$rt_terminal, input$rt_postcode, input$rt_slot, input$rt_contract, 
                  0, 1, 1, 1)
      datasets$requests[nrow(datasets$requests) + 1,] = new_req
    })
  })
  
  output$rt_requestsTable <- DT::renderDataTable({
    input$rt_submit
    datasets$requests[,1:12]
  })
  
  ##================================== View and accept Bids ====================================
  
  # output$bids_kable <- function() {
  #   
  #   knitr::kable(bids[1:40, 1:6], "html") %>%
  #     kable_styling("striped", full_width = T) %>%
  #     group_rows("Request ID: 1", 1, 10) %>%
  #     group_rows("Request ID: 2", 11, 20) %>%
  #     group_rows("Request ID: 3", 21, 30) %>%
  #     group_rows("Request ID: 4", 31, 40) 
  # }
  
  output$vb_filters <- renderUI({
    box(width = 12, status = "info",
        selectInput("vb_cntnrID", "Select Request:", c(1, 2, 3, 4))
    )
  })
  
  shinyInput <- function(FUN, len, id, ...) {
    inputs <- character(len)
    for (i in seq_len(len)) {
      inputs[i] <- as.character(FUN(paste0(id, i), ...))
    }
    inputs
  }
  
  # df <- reactiveValues(
  #   data = filter(isolate(datasets$bids), Container_Id == isolate(input$vb_cntnrID)) %>%
  #     mutate(Action = shinyInput(actionButton,
  #                                40,
  #                                #nrow(filter(isolate(datasets$bids), Container_Id == isolate(input$vb_cntnrID))), 
  #                                'button_', 
  #                                label = "Sign Contract", 
  #                                onclick = 'Shiny.onInputChange(\"select_button\",  this.id)' ))
  #   # data = data.frame(
  #   #   BidID = filter(datasets$bids, ContainerId == input$vb_cntnrID),
  #   #   Rating = filter(datasets$bids, ContainerId == input$vb_cntnrID),
  #   #   OrdersProcessed = filter(datasets$bids, ContainerId == input$vb_cntnrID),
  #   #   AskPrice = filter(datasets$bids, ContainerId == input$vb_cntnrID),
  #   #   Action = shinyInput(actionButton, 
  #   #                       10, 
  #   #                       'button_', label = "Sign Contract", 
  #   #                       onclick = 'Shiny.onInputChange(\"select_button\",  this.id)' ),
  #   #   stringsAsFactors = FALSE,
  #   #   row.names = 1:10
  #   # )
  # )
  
  output$vb_bidsTable <- DT::renderDataTable({
    input$vb_cntnrID
    ndata = nrow(filter(isolate(datasets$bids), Container_Id == isolate(input$vb_cntnrID)))
    data = filter(isolate(datasets$bids), Container_Id == isolate(input$vb_cntnrID))
    mutate(data, Action = shinyInput(actionButton,
                                 ndata,
                                 'button_',
                                 label = "Sign Contract",
                                 onclick = 'Shiny.onInputChange(\"select_button\",  this.id)'
                                 ))
  })
  
  observeEvent(input$select_button, {
    selectedRow <- as.numeric(strsplit(input$select_button, "_")[[1]][2])
    df$data <- df$data[rownames(df$data) != selectedRow, ]
  })
  
  ##=============================== Track and update contracts =============================
  
  output$vc_contractsTable <- function() {
    
    kable(datasets$contract_updates[1:10, 2:4], "html") %>%
      kable_styling("striped", full_width = T) %>%
      group_rows("Contract ID: 1 | Request ID: a | Bid ID: x", 1, 4) %>%
      group_rows("Contract ID: 2 | Request ID: b | Bid ID: y", 5, 7) %>%
      group_rows("Contract ID: 3 | Request ID: c | Bid ID: z", 8, 9) %>%
      group_rows("Contract ID: 4 | Request ID: d | Bid ID: w", 10, 10) 
  }
}

##================================ Run the application =====================================
shinyApp(ui = ui, server = server)

