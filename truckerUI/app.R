library(shiny)
library(shinydashboard)
library(dplyr)
library(readr)
library(jsonlite)
library(httr)
library(DT)

default_trucker_id = 1
default_rest_addr = "http://761f99c2.eu.ngrok.io/"

#---------------------------- API Names for trucker------------------------

api_initialization = "test/initnetwork"
api_trucker_profile = "trucker"
api_get_rating = "rating"
#api_get_preferences = "preferences" 
#api_update_preferences = "preferences"

api_bidding_history = "truckerBids"

api_place_bid = "submitBid"
api_cancel_bid = "ContainerDeliveryJobOffer/cancelBid"

api_bidding_history = "bids"

api_job_offers = "ContainerDeliveryJobOffer/search/?"

api_contracts = "contractedJobs"
api_accept_delivery = "acceptDelivery"
path_contracts = "ContainerDeliveryJob"
api_raise_exception = "raiseException"

##======================================Layout=============================================

ui <- dashboardPage(skin = "blue",
                    
                    dashboardHeader(title = 'Trucker UI', titleWidth = 250),
                    
                    dashboardSidebar(width = 250,
                                     sidebarMenu(id = "mainmenu",
                                                 menuItem("View requests & place bids", tabName = "viewRequests", icon = icon("home")),
                                                 menuItem("View & manage bids", tabName = "trackBids", icon = icon("free-code-camp")),
                                                 menuItem("Track & update contracts", tabName = "viewContracts", icon = icon("area-chart")),
                                                 menuItem("Profile", tabName = "profile", icon = icon("address-card-o"))
                                     )
                    ),
                    
                    dashboardBody(
                      tabItems(
                        tabItem(tabName = "viewRequests",
                                
                                fluidRow(width = 12, #status = "info", title = "Available shipping requests",
                                         column(width = 2,
                                                # radioButtons("vr_exim", "Destination type", choices = list(
                                                #   "Import" = "IMP",	
                                                #   "Export" = "EXP"),
                                                #   selected = "IMP"),
                                                # radioButtons("vr_cntnrType", "Container Type",
                                                #              choices = list("20", "40"), selected = "20")
                                                # selectInput("vr_slot", "Slot", c(
                                                #   "00:00 - 06:00",
                                                #   "06:00 - 12:00",
                                                #   "12:00 - 18:00",
                                                #   "18:00 - 00:00"
                                                # ))
                                                textInput("vr_dest", "Destinations", value = "Berlin")
                                         ),
                                         column(width = 2,   
                                                numericInput("vr_max_dist", "Max Distance", value = 1000)
                                         ),
                                         column(width = 2,   
                                                dateInput("vr_from", 
                                                          "From", 
                                                          value = "2018-01-01")
                                         ),
                                         column(width = 2,  
                                                dateInput("vr_to", 
                                                          "To", 
                                                          value = "2018-03-30")
                                         ),
                                         column(width = 1,  
                                                br(),
                                                checkboxInput("vr_adr", "ADR", value = TRUE)
                                         ),
                                         column(width = 3,   
                                                br(),
                                                actionButton("vr_search", "Search Job Offers")
                                         )
                                         
                                ),
                                fluidRow(width = 12,
                                         column(width = 12,
                                                br(),
                                                br(),
                                                dataTableOutput("vr_requestsTable")
                                         )
                                ),
                                fluidRow(width = 12, #status = "primary", title = "Place bid",
                                         column(width = 6,
                                                br(),
                                                br(),
                                                verbatimTextOutput("vr_request_details")
                                         ),
                                         column(width = 3,
                                                numericInput("vr_bid_amount", "Bid amount", value=100)
                                         ),
                                         column(width = 3,
                                                br(),
                                                actionButton("vr_submit", "Bid")
                                         )
                                ),
                                fluidRow(width =12, 
                                         column(width = 12,
                                                br(),
                                                br(),
                                                verbatimTextOutput("vr_placed_bid_details")
                                         )
                                )
                        ),
                        
                        
                        tabItem(tabName = "trackBids",
                                # selectInput("tb_filter", "Bid types:", choices = list(
                                #   "All" = 0,
                                #   "Accepted" = 1,
                                #   "Rejected" = 2,
                                #   "Open" = 3),
                                #   selected = "All"),
                                fluidRow(width = 12,
                                         column(width = 1,
                                                br()
                                         ),
                                         column(width = 11,
                                                actionButton("tb_refresh", "Refresh")
                                         )
                                ),
                                fluidRow(width = 12,
                                         br(),
                                         br(),
                                         dataTableOutput("tb_bidsTable")
                                         
                                ),
                                fluidRow(width = 12, status = "primary",
                                         column(width = 6,
                                                verbatimTextOutput("tb_bid_details")
                                         ),
                                         column(width = 6,
                                                br(),
                                                actionButton("tb_cancel", "Cancel Bid")
                                         )
                                ),
                                fluidRow(width =12, 
                                         column(width = 12,
                                                br(),
                                                br(),
                                                verbatimTextOutput("tb_cancelled_bid_details")
                                         )
                                )
                        ),
                        tabItem(tabName = "viewContracts", 
                                # selectInput("vc_filter", "Contract types:", choices = list(
                                #   "Under Process" = 0,
                                #   "Settled" = 1,
                                #   "Exception Raised" = 2),
                                #   selected = "Under Process"),
                                fluidRow(width = 12,
                                         column(width = 1,
                                                br()
                                         ),
                                         column(width = 11,
                                                actionButton("vc_refresh", "Refresh")
                                         )
                                ),
                                fluidRow(width = 12,
                                         br(),
                                         br(),
                                         dataTableOutput("vc_contractsTable")
                                ),
                                fluidRow(width = 12, #status = "primary", title = "Update contracts",
                                         column(width = 6,
                                                verbatimTextOutput("vc_contract_details")
                                         ),
                                         column(width = 6,
                                                br(),
                                                textInput("vc_pass", "Acknowledgement Key"),
                                                br(),
                                                br(),
                                                actionButton("vc_accept_delivery", "Register Delivery"),
                                                br(),
                                                br(),
                                                textInput("vc_exception_details", "Exception Detials", value = "Enter text.."),
                                                br(),
                                                br(),
                                                actionButton("vc_exception", "Raise exception")
                                         )
                                ),
                                fluidRow(width =12, 
                                         column(width = 12,
                                                br(),
                                                br(),
                                                verbatimTextOutput("vc_contract_update_details")
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
    rest_status = "Unknown",
    trucker_id = default_trucker_id,
    place_bid_status = "",
    cancel_bid_status = "",
    update_contract_status = ""
  )
  
  ##================================== Create and view requests ================================
  
  output$vr_requestsTable <- DT::renderDataTable(server = TRUE,
                                                 selection = 'single',
                                                 extensions = "Buttons", 
                                                 options = list(#paging = FALSE,
                                                   stringsAsFactors = FALSE, autoWidth = TRUE), rownames= FALSE,
                                                 #dom = "Bfrtip", 
                                                 #buttons = list('copy', 'pdf', 'csv', 'excel', 'print')),
                                                 {
                                                   input$vr_search
                                                   isolate({
                                                     ADR="NONE"
                                                     if(input$vr_adr){
                                                       ADR="YES"
                                                     }
                                                     query=paste0("dest=", input$vr_dest,
                                                                  "&maxdist=",input$vr_max_dist,
                                                                  "&from=", input$vr_from,
                                                                  "&to=", input$vr_to,
                                                                  "&adr=", ADR
                                                     )
                                                     job_list <- as.data.frame(fromJSON(paste0(profileInfo$rest_addr,
                                                                                               api_job_offers,
                                                                                               query)))
                                                     if(nrow(job_list)==0)
                                                       data.frame(Results = c("Nothing to show here!"))
                                                     else
                                                       job_list
                                                   })
                                                 }
  )
  
  output$vr_request_details = renderPrint({
    if(!is.null(input$vr_requestsTable_rows_selected))
      isolate({
        ADR="NONE"
        if(input$vr_adr){
          ADR="YES"
        }
        query=paste0("dest=", input$vr_dest,
                     "&from=", input$vr_from,
                     "&to=", input$vr_to,
                     "&adr=", ADR
        )
        job_list <- as.data.frame(fromJSON(paste0(profileInfo$rest_addr,
                                                  api_job_offers,
                                                  query)))
        s <- job_list$containerDeliveryJobOfferId[input$vr_requestsTable_rows_selected]
        if (length(s)) {
          cat('Request', s, 'has been selected.\n\n')
        }
      })
  })
  
  observeEvent(
    input$vr_submit, 
    isolate({
      ADR="NONE"
      if(input$vr_adr){
        ADR="YES"
      }
      query=paste0("dest=", input$vr_dest,
                   "&from=", input$vr_from,
                   "&to=", input$vr_to,
                   "&adr=", ADR
      )
      job_list <- as.data.frame(fromJSON(paste0(profileInfo$rest_addr,
                                                api_job_offers,
                                                query)))
      request_Id <- job_list$containerDeliveryJobOfferId[input$vr_requestsTable_rows_selected]
      profileInfo$place_bid_status <- as.character(POST(paste0(profileInfo$rest_addr, api_trucker_profile, "/", request_Id, "/",
                                                               api_place_bid, "/", profileInfo$trucker_id, "/",
                                                               input$vr_bid_amount)))
    })
  )
  
  observeEvent(
    input$vr_requestsTable_rows_selected,
    #if(is.null(input$vr_requestsTable_rows_selected))
    isolate({
      profileInfo$place_bid_status = ""
    })
  )
  
  output$vr_placed_bid_details = renderPrint({
    cat(profileInfo$place_bid_status)
  })
  
  ##================================== View and manage Bids ====================================
  
  output$tb_bidsTable <- DT::renderDataTable(server = TRUE,
                                             selection = 'single',
                                             extensions = "Buttons", 
                                             options = list(
                                               stringsAsFactors = FALSE, autoWidth = TRUE), rownames= FALSE,
                                             #dom = "Bfrtip", 
                                             #buttons = list('copy', 'pdf', 'csv', 'excel', 'print')),
                                             {
                                               input$tb_refresh
                                               as.data.frame(fromJSON(paste0(profileInfo$rest_addr, api_trucker_profile, "/", api_bidding_history, "/", profileInfo$trucker_id)))
                                             }
  )
  
  output$tb_bid_details = renderPrint({
    bid_history = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, api_trucker_profile, "/", api_bidding_history, "/", profileInfo$trucker_id)))
    s = bid_history$truckerBidId[input$tb_bidsTable_rows_selected]
    if (length(s)) {
      cat('Bid', s, 'has been selected.\n\n')
    }
  })
  
  observeEvent(
    input$tb_cancel, 
    isolate({
      bid_history = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, api_trucker_profile, "/", api_bidding_history, "/", profileInfo$trucker_id)))
      bid_Id <- bid_history$truckerBidId[input$tb_bidsTable_rows_selected]
      profileInfo$cancel_bid_status <- as.character(POST(paste0(profileInfo$rest_addr,
                                                                api_cancel_bid, "/",
                                                                bid_Id)))
    })
  )
  
  observeEvent(
    input$tb_bidsTable_rows_selected, 
    isolate({
      profileInfo$cancel_bid_status = ""
    })
  )
  
  output$tb_cancelled_bid_details = renderPrint({
    cat(profileInfo$cancel_bid_status)
  })
  
  ##=============================== Track and update contracts =============================
  
  
  output$vc_contractsTable <- DT::renderDataTable(server = TRUE,
                                                  selection = 'single',
                                                  extensions = "Buttons", 
                                                  options = list( #paging = FALSE,
                                                    stringsAsFactors = FALSE, autoWidth = TRUE), rownames= FALSE,
                                                  # dom = "Bfrtip", 
                                                  # buttons = list('copy', 'pdf', 'csv', 'excel', 'print')),
                                                  {
                                                    input$vc_refresh
                                                    as.data.frame(fromJSON(paste0(profileInfo$rest_addr, 
                                                                                  api_trucker_profile, "/", 
                                                                                  api_contracts, "/", 
                                                                                  profileInfo$trucker_id)))
                                                  }
  )
  
  output$vc_contract_details = renderPrint({
    contracts_table = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, 
                                                    api_trucker_profile, "/", 
                                                    api_contracts, "/", 
                                                    profileInfo$trucker_id)))
    s <- contracts_table$containerDeliveryJobId[input$vc_contractsTable_rows_selected]
    if (length(s)) {
      cat('Contract', s, 'has been selected.\n\n')
    }
  })
  
  observeEvent(
    input$vc_accept_delivery, 
    isolate({
      contracts_table = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, 
                                                      api_trucker_profile, "/", 
                                                      api_contracts, "/", 
                                                      profileInfo$trucker_id)))
      contract_Id <- contracts_table$containerDeliveryJobId[input$vc_contractsTable_rows_selected]
      profileInfo$update_contract_status <- as.character(POST(paste0(profileInfo$rest_addr,
                                                                     api_trucker_profile, "/",
                                                                     api_accept_delivery, "/",
                                                                     contract_Id, "/",
                                                                     input$vc_pass)))
    })
  )
  
  observeEvent(
    input$vc_exception, 
    isolate({
      contracts_table = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, 
                                                      api_trucker_profile, "/", 
                                                      api_contracts, "/", 
                                                      profileInfo$trucker_id)))
      contract_Id <- contracts_table$containerDeliveryJobId[input$vc_contractsTable_rows_selected]
      profileInfo$update_contract_status <- as.character(POST(paste0(profileInfo$rest_addr,
                                                                     path_contracts, "/",
                                                                     contract_Id, "/",
                                                                     api_raise_exception),
                                                              body = list(details = input$vc_exception_details)
      ))
    })
  )
  
  observeEvent(
    input$vc_contractsTable_rows_selected, 
    isolate({
      profileInfo$update_contract_status = ""
    })
  )
  
  output$vc_contract_update_details = renderPrint({
    cat(profileInfo$update_contract_status)
  })
  
  
  ##==================================Profile================================================
  
  output$pr_rest_details <- renderPrint({
    isolate({
      addr = profileInfo$rest_addr
      profileInfo$rest_status <- content(GET(paste0(default_rest_addr, api_initialization)), "text")
      if (length(addr)) {
        cat('REST Server: ', addr, '\n\n')
        cat('Connection Status: ', profileInfo$rest_status, '\n')
      }
    })
  })
  
  observeEvent(input$pr_update_rest, isolate(profileInfo$rest_addr <- input$pr_rest_addr))
  
  output$pr_trucker_details <- renderPrint({
    id = profileInfo$trucker_id
    profile = as.data.frame(fromJSON(paste0(profileInfo$rest_addr, api_trucker_profile, "/", profileInfo$trucker_id)))
    #rating = as.character(fromJSON(paste0(profileInfo$rest_addr, api_trucker_profile, "/", api_get_rating, "/", profileInfo$trucker_id)))
    if (length(id)) {
      cat(" Trucker ID: ", id, "\n",
          "Name: ", as.character(profile$firstName[1]), " ", as.character(profile$lastName[1]), "\n",
          "ADR Training: ", as.character(profile$adrTraining[1]), "\n",
          "Truck Capacity: ", as.character(profile$truckCapacity[1]), "\n\n",
          "Jobs delivered: ", as.character(profile$rating.jobsDelivered[1]), "\n",
          "Jobs accepted: ", as.character(profile$rating.totalPastJobsAccepted[1]), "\n\n"
      )
      cat("\n\n")
      #cat("Rating: ", rating)
    }
  })
  
  observeEvent(input$pr_update_id, isolate(profileInfo$trucker_id <- input$pr_trucker_id))
  
}

##================================ Run the application =====================================
shinyApp(ui = ui, server = server)

